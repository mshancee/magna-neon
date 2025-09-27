import { db } from "@/drizzle/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function userHasPassword(userId: string): Promise<boolean> {
  try {
    const user = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return !!user[0]?.passwordHash;
  } catch (error) {
    console.error("Error checking user password:", error);
    return false;
  }
}

export async function getUserAuthMethods(userId: string) {
  try {
    const { accounts } = await import("@/drizzle/schema");

    const [userResult, accountsResult] = await Promise.all([
      db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
      db
        .select({ provider: accounts.provider })
        .from(accounts)
        .where(eq(accounts.userId, userId)),
    ]);

    const hasPassword = !!userResult[0]?.passwordHash;
    const oauthProviders = accountsResult.map((account) => account.provider);

    return {
      hasPassword,
      oauthProviders,
      hasGitHub: oauthProviders.includes("github"),
    };
  } catch (error) {
    console.error("Error getting user auth methods:", error);
    return {
      hasPassword: false,
      oauthProviders: [],
      hasGitHub: false,
    };
  }
}
