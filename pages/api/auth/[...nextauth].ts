import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error',
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
};

export default NextAuth(authOptions); 