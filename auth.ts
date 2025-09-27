import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@/drizzle/schema/enums";
import { db } from "@/drizzle/drizzle";
import { users, accounts } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

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
      allowDangerousEmailAccountLinking: true,
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

          if (existingUser) {
            // User exists, link the GitHub account
            // SECURITY CHECK: This is handled by allowDangerousEmailAccountLinking
            // but we add extra logging for security awareness
            console.log("[Auth] Linking GitHub account to existing user:", {
              userId: existingUser.id,
              email: existingUser.email,
              githubEmail: user.email,
            });

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
              console.log("[Auth] Successfully linked GitHub account");
            } else {
              console.log("[Auth] GitHub account already linked");
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

            return true;
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

            // Detect location for GitHub users
            let locationData = {
              countryCode: "KE", // Default fallback
              country: "Kenya",
            };

            try {
              // Try to get location data via IP detection
              const { getLocationDataFromIP } = await import(
                "./utils/location-detector"
              );

              const detectedLocation = await getLocationDataFromIP();
              locationData = {
                countryCode: detectedLocation.countryCode,
                country: detectedLocation.country || "Kenya", // Handle null case
              };
              console.log(
                "[Auth] Detected location for GitHub user:",
                locationData
              );
            } catch (error) {
              console.warn(
                "[Auth] Could not detect location for GitHub user, using defaults:",
                error
              );
            }

            // Create user record with GitHub data and detected location
            const [newUser] = await db
              .insert(users)
              .values({
                email: user.email!,
                name: user.name || "GitHub User",
                image: user.image || null, // GitHub avatar URL
                referralCode,
                countryCode: locationData.countryCode,
                country: locationData.country,
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

            console.log(
              "[Auth] Created new user with GitHub account:",
              newUser.id
            );
            return true;
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
        // Initial sign in - get user data from database
        try {
          const { getUserByEmail } = await import("./lib/users/signup");
          const dbUser = await getUserByEmail(user.email!);

          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.picture = dbUser.image || user.image;
            token.role = dbUser.role || "user";
            token.status = dbUser.status || "active";
            token.country = dbUser.country || "KE";
            token.referralCode = dbUser.referralCode || "";
          } else {
            // Fallback to user object data
            token.id = user.id;
            token.email = user.email!;
            token.name = user.name!;
            token.picture = user.image;
            token.role = "user";
            token.status = "active";
            token.country = "KE";
            token.referralCode = "";
          }
        } catch (error) {
          console.error("[Auth] Error fetching user data for JWT:", error);
          // Fallback to user object data
          token.id = user.id;
          token.email = user.email!;
          token.name = user.name!;
          token.picture = user.image;
          token.role = "user";
          token.status = "active";
          token.country = "KE";
          token.referralCode = "";
        }
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
    error: "/auth/error",
  },
  session: {
    strategy: "jwt", // Use JWT sessions for simplicity
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});
