import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";
import { generateShareSlug } from "@/lib/utils";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  let story = await Story.findOne({ userId: session.user.id });
  if (!story) {
    return NextResponse.json({ error: "No story to share" }, { status: 400 });
  }

  if (!story.sharedSlug) {
    let slug = generateShareSlug();
    let exists = await Story.exists({ sharedSlug: slug });
    while (exists) {
      slug = generateShareSlug();
      exists = await Story.exists({ sharedSlug: slug });
    }
    story.sharedSlug = slug;
    await story.save();
  }

  return NextResponse.json({ slug: story.sharedSlug });
}
