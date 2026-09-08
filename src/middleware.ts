import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect everything except Next internals and static assets.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
