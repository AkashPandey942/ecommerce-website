import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber, 
      workStatus, 
      organizationName, 
      state, 
      city 
    } = data;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      workStatus,
      organizationName,
      state,
      city,
      credits: 100 // Starting credits
    });

    return NextResponse.json({ 
      success: true, 
      message: "User created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });

  } catch (error: any) {
    console.error("❌ [API/Register] Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
