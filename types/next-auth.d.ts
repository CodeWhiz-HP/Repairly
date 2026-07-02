import "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    name: string;
  }

  interface Session {
    user: {
      _id?: string;
      name?: string;
    } & DefaultSession["user"]
  }
}
