import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role?: string;
    businessName?: string | null;
  }

  interface Session {
    user: {
      id?: string;
      _id?: string;
      name?: string;
      email?: string;
      role?: string;
      businessName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    businessName?: string | null;
  }
}
