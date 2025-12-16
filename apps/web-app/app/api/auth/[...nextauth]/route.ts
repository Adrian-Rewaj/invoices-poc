import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser } from '../../../../lib/auth';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await authenticateUser(credentials.username, credentials.password);
        if (!user) return null;

        // Return user object
        return { id: user.id, name: user.username };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.username;
      return session;
    },
  },
  pages: {
    signIn: '/login', // optional custom sign-in page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
