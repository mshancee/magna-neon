import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserAuthMethods } from "@/lib/users/password-utils";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const authMethods = await getUserAuthMethods(session.user.id);

    return NextResponse.json(authMethods);
  } catch (error) {
    console.error("Error getting auth methods:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
