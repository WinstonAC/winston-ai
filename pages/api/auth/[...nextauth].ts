import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env-loader';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Validate required environment variables
if (!env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is not set');
if (!env.GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_SECRET is not set');
if (!env.NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET is not set');

const NEXTAUTH_URL = env.NEXTAUTH_URL || 'http://localhost:3000';

// Enhanced debug logging
console.log('NextAuth Configuration:', {
  baseUrl: NEXTAUTH_URL,
  clientId: env.GOOGLE_CLIENT_ID,
  hasSecret: !!env.GOOGLE_CLIENT_SECRET,
  hasDatabaseUrl: !!env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV,
  callbackUrl: `${NEXTAUTH_URL}/api/auth/callback/google`,
});

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: true,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) {
          throw new Error('No user found');
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }
        return user;
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile });
      return true;
    },
    async session({ session, user }) {
      console.log('Session callback:', { session, user });
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('Sign in event:', { user, account, profile });
    },
    async signOut({ token, session }) {
      console.log('Sign out event:', { token, session });
    },
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default NextAuth(authOptions); 