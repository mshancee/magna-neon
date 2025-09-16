import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { UserRole, UserStatus } from "@/drizzle/schema/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      status: UserStatus;
      country: string;
      referralCode: string;
      createdAt: string;
      updatedAt: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    country: string;
    referralCode: string;
    createdAt: string;
    updatedAt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    country: string;
    referralCode: string;
  }
}
