import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/constants";

// Edge-safe config shared with middleware. No database or Node-only imports here.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

      if (isPublic) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.companyId = (user as { companyId?: string | null }).companyId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.companyId = (token.companyId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
