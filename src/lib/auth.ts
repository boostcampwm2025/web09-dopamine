import { NextAuthOptions } from 'next-auth';
import { Adapter, AdapterUser } from 'next-auth/adapters';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: async (data: Omit<AdapterUser, 'id'>) => {
      // displayName을 name과 동일하게 설정
      return prisma.user.create({
        data: {
          ...data,
          displayName: data.name,
        },
      });
    },
  } as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || '',
      clientSecret: process.env.NAVER_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 12,
    updateAge: 60 * 60 * 1,
  },
  jwt: {
    maxAge: 60 * 60 * 12,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.displayName = token.displayName;
        // 프로필 이미지가 없으면 기본 이미지 경로 설정
        session.user.image = session.user.image || '/profile.svg';
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        if (session?.name) token.name = session.name;
        if (session?.displayName) token.displayName = session.displayName;
      }

      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { displayName: true },
        });
        token.displayName = dbUser?.displayName ?? undefined;
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
  },
};
