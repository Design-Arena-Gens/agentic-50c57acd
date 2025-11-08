import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user"
  });

  return NextResponse.json({ id: user._id, email: user.email });
}
