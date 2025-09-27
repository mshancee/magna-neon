import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@/drizzle/schema/enums";
import { db } from "@/drizzle/drizzle";
import { users, accounts } from "@/drizzle/schema";

// Extend NextAuth's expected User type with the required shape
interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
  country: string;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
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
            isValidPassword = await bcrypt.compare(password, user.passwordHash);
            console.log("[Auth] Password validation result:", isValidPassword);
          } else {
            // User exists but has no password (GitHub-only user)
            console.log("[Auth] User has no password set (OAuth-only):", email);
            throw new Error("OAUTH_ONLY_USER");
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
            image: user.image,
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
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        try {
          // Check if user already exists
          const { getUserByEmail } = await import("./lib/users/signup");
          const existingUser = await getUserByEmail(user.email!);
          const { eq, and } = await import("drizzle-orm");

          if (existingUser) {
            // User exists, link the GitHub account
            // Check if GitHub account is already linked
            const existingAccount = await db
              .select()
              .from(accounts)
              .where(
                and(
                  eq(accounts.provider, "github"),
                  eq(accounts.providerAccountId, account.providerAccountId!)
                )
              )
              .limit(1);

            if (existingAccount.length === 0) {
              // Link GitHub account to existing user
              await db.insert(accounts).values({
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId!,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              });
            }

            // Update existing user with GitHub avatar if they don't have one
            if (!existingUser.image && user.image) {
              await db
                .update(users)
                .set({
                  image: user.image,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingUser.id));
            }

            // Update user object with existing user data for session
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.status = existingUser.status;
            user.country = existingUser.country || "US";
            user.referralCode = existingUser.referralCode;
            user.image = existingUser.image || user.image; // Use existing or GitHub avatar
          } else {
            // Generate referral code for new GitHub users
            const generateReferralCode = (): string => {
              const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
              let result = "";
              for (let i = 0; i < 8; i++) {
                result += chars.charAt(
                  Math.floor(Math.random() * chars.length)
                );
              }
              return result;
            };

            const referralCode = generateReferralCode();

            // Create user record with GitHub data
            const [newUser] = await db
              .insert(users)
              .values({
                email: user.email!,
                name: user.name || "GitHub User",
                image: user.image || null, // GitHub avatar URL
                referralCode,
                countryCode: "US", // Default, can be enhanced with IP detection
                country: "United States",
                status: "active", // GitHub users are active by default
                role: "user",
                // passwordHash is null for OAuth users
              })
              .returning();

            // Create account record
            await db.insert(accounts).values({
              userId: newUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId!,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            });

            // Update user object with new user data
            user.id = newUser.id;
            user.role = newUser.role;
            user.status = newUser.status;
            user.country = newUser.country || "US";
            user.referralCode = newUser.referralCode;
          }
        } catch (error) {
          console.error("Error handling GitHub user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in - populate token with user data
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image; // NextAuth uses 'picture' for images
        token.role = user.role || "user";
        token.status = user.status || "active";
        token.country = user.country || "KE";
        token.referralCode = user.referralCode || "";
      }
      console.log("[Auth] JWT token created:", token);
      return token;
    },
    async session({ session, token, user }) {
      // For database sessions, user object is available
      if (user) {
        session.user.id = user.id;
        session.user.image = user.image;
        session.user.role = user.role || "user";
        session.user.status = user.status || "active";
        session.user.country = user.country || "KE";
        session.user.referralCode = user.referralCode || "";
      } else {
        // For JWT sessions, use token data
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.country = token.country as string;
        session.user.referralCode = token.referralCode as string;
      }

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
    strategy: "jwt", // Use JWT sessions for simplicity
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
});
