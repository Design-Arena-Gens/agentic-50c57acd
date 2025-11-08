import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const story = await Story.findOne({ userId: session.user.id }).lean();
  return NextResponse.json({ story });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();

  await connectToDatabase();

  const story = await Story.findOneAndUpdate(
    { userId: session.user.id },
    { $set: payload },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ story });
}
