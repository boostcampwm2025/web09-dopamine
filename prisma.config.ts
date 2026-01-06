import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL이 없으면 개별 환경변수로 구성
const databaseUrl = process.env["DATABASE_URL"] || 
  `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
