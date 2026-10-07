import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Save Google user to our localStorage DB via a cookie/session
      // The actual localStorage save happens client-side in the callback page
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).googleId = token.sub;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.googleId = token.sub;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
    newUser: '/auth/google-complete', // New Google users go here to pick role
  },
  secret: process.env.NEXTAUTH_SECRET || 'agronomy360-secret-key',
});

export { handler as GET, handler as POST };
