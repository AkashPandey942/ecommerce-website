import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authService } from "@/services/authService";

/**
 * GET /api/user/profile
 * Returns the current authenticated user's profile from MongoDB.
 * This runs exclusively on the server, keeping Mongoose out of the client bundle.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const profile = await authService.getUserProfile(userId);

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (error: any) {
    console.error("❌ [/api/user/profile] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
