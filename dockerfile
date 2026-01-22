# deps
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
COPY . .
RUN yarn build

# runner (통합형: migrate + server)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# next standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# prisma schema/migrations + config
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# prisma client runtime engines
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# prisma CLI (깨지지 않게 deps에서 필요한 것 통째로)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

# start.sh (호환성 좋은 방식)
RUN cat > /app/start.sh <<'EOF'
#!/bin/sh
set -e

echo "Running database migrations..."
for i in 1 2 3 4 5; do
  if node_modules/.bin/prisma migrate deploy; then
    echo "Migrations completed successfully!"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "Migration failed after 5 attempts"
    exit 1
  fi
  echo "Migration failed, retrying in 3 seconds... (attempt $i/5)"
  sleep 3
done

echo "Starting server..."
exec node server.js
EOF

RUN chmod +x /app/start.sh

USER nextjs
EXPOSE 3000
CMD ["/app/start.sh"]
