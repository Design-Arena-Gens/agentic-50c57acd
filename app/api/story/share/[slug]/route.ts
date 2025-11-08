import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await connectToDatabase();
  const story = await Story.findOne({ sharedSlug: params.slug })
    .select("-userId -generatedDrafts")
    .lean();

  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ story });
}
