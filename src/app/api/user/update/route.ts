import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    await connectDB();

    // Fields allowed to be updated
    const updateData = {
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      workStatus: body.workStatus,
      organizationName: body.organizationName,
      state: body.state,
      city: body.city,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("❌ [API Update User] Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
