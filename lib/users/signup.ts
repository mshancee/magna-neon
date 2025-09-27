import { eq } from "drizzle-orm";
import { db } from "@/drizzle/drizzle";
import { users } from "@/drizzle/schema";

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        role: users.role,
        status: users.status,
        passwordHash: users.passwordHash,
        referralCode: users.referralCode,
        country: users.country,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    console.log("[getUserByEmail] Found user:", user);

    return user || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

// Check if user exists by email
export async function userExistsByEmail(email: string): Promise<boolean> {
  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    return !!user;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
}
