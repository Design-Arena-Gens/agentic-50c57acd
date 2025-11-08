import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Story from "@/models/Story";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const users = await User.find().lean();
  const stories = await Story.find().lean();

  const mapped = users.map((user) => {
    const story = stories.find((s) => s.userId.toString() === user._id.toString());
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      storyUpdatedAt: story?.updatedAt,
      timelineCount: story?.timeline?.length ?? 0
    };
  });

  return NextResponse.json({ users: mapped });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, role } = body;

  await connectToDatabase();
  await User.findByIdAndUpdate(userId, { role });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await connectToDatabase();
  await User.findByIdAndDelete(id);
  await Story.deleteOne({ userId: id });

  return NextResponse.json({ success: true });
}
