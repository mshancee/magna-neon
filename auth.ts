import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@/drizzle/schema/enums";

// Extend NextAuth's expected User type with the required shape
interface AuthUser {
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>
      ): Promise<AuthUser | null> {
        try {
          // Defensive check + type assertion
          const email = credentials.email;
          const password = credentials.password;

          if (typeof email !== "string" || typeof password !== "string") {
            console.log("[Auth] Invalid credentials format");
            return null;
          }

          // Lazy load the getUserByEmail function to avoid client-side database imports
          const { getUserByEmail } = await import("./lib/users/signup");
          const user = await getUserByEmail(email);

          if (!user) {
            return null;
          }

          // Check if user is banned
          if (user.status === "banned") {
            return null;
          }

          let isValidPassword = false;
          if (user.passwordHash) {
            console.log("[Auth] Comparing password for user:", email);
            console.log("[Auth] Stored hash:", user.passwordHash);
            isValidPassword = await bcrypt.compare(password, user.passwordHash);
            console.log("[Auth] Password validation result:", isValidPassword);
          }

          if (!isValidPassword) {
            console.log("[Auth] Invalid password for:", email);
            return null;
          }

          console.log("[Auth] Successfully authenticated:", {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role ?? "user",
            status: user.status ?? "inactive",
            country: user.country ?? "KE",
            referralCode: user.referralCode ?? "",
            createdAt:
              user.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt:
              user.updatedAt?.toISOString() ?? new Date().toISOString(),
          };
        } catch (error) {
          console.error("[Auth] Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in - populate token with user data
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.status = user.status;
        token.country = user.country;
        token.referralCode = user.referralCode;
      }
      console.log("[Auth] JWT token created:", token);
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.role = token.role;
      session.user.status = token.status;
      session.user.country = token.country as string;
      session.user.referralCode = token.referralCode as string;
      session.user.createdAt = new Date().toISOString();
      session.user.updatedAt = new Date().toISOString();

      console.log("[Auth] Session created:", session);

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs properly
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // If the URL is from the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default redirect to home page
      return `${baseUrl}/`;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
});
