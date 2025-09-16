import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toString().trim().toLowerCase();
        if (!email) return null;
        // Create or find a demo user by email
        const user = await prisma.user.upsert({
          where: { email },
          create: { email, name: email.split("@")[0] ?? "Demo" },
          update: {},
        });
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
