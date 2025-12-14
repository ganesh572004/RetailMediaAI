import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          // Check if input is a phone number (simple check: contains only digits/plus/spaces/dashes and no @)
          const isPhone = /^[0-9+\-\s()]+$/.test(credentials.email) && !credentials.email.includes('@');
          
          let userEmail = credentials.email;
          
          // NOTE: In a real app with a database, you would query the DB here.
          // Since we are using client-side storage (localforage) which is inaccessible here on the server,
          // we rely on the client to resolve phone numbers to emails BEFORE calling signIn.
          
          // If we still receive a phone number here, it means client-side resolution failed or was bypassed.
          // To enforce "same account" policy, we should strictly treat this as an email login or fail.
          // However, for robustness, if it IS a phone number, we'll just return null (fail auth)
          // because we don't want to create a separate "Phone User" account.
          
          if (isPhone) {
             return null;
          }

          return {
            id: "1",
            name: credentials.email.split('@')[0],
            email: credentials.email,
            image: null
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "email,public_profile",
        },
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
      version: "2.0", // Opt-in to Twitter OAuth 2.0
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
