import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const event = {
    _id: new Types.ObjectId(),
    title: body.title,
    description: body.description,
    date: body.date ? new Date(body.date) : undefined,
    imageUrl: body.imageUrl,
    category: body.category
  };

  await connectToDatabase();

  const story = await Story.findOneAndUpdate(
    { userId: session.user.id },
    { $push: { timeline: event } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ story });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...update } = body;

  await connectToDatabase();

  const story = await Story.findOneAndUpdate(
    { userId: session.user.id, "timeline._id": id },
    {
      $set: {
        "timeline.$.title": update.title,
        "timeline.$.description": update.description,
        "timeline.$.date": update.date ? new Date(update.date) : undefined,
        "timeline.$.imageUrl": update.imageUrl,
        "timeline.$.category": update.category
      }
    },
    { new: true }
  ).lean();

  return NextResponse.json({ story });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await connectToDatabase();

  const story = await Story.findOneAndUpdate(
    { userId: session.user.id },
    { $pull: { timeline: { _id: new Types.ObjectId(id) } } },
    { new: true }
  ).lean();

  return NextResponse.json({ story });
}
