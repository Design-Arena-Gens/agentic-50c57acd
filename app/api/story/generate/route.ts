import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";
import { GoogleGenerativeAI } from "@google/generative-ai";

const stylePrompts: Record<string, string> = {
  emotional: "Write with heartfelt language, vivid emotions, and reflective tone.",
  professional: "Write with a polished, structured, and inspiring yet formal tone.",
  simple: "Write in clear, concise language with an approachable tone.",
  poetic: "Write with lyrical descriptions, metaphors, and rhythmic cadence."
};

function buildPrompt(style: string, data: any) {
  const sections = [
    ["Personal Information", JSON.stringify(data?.personalInformation ?? {})],
    ["Childhood Memories", data?.childhoodMemories ?? ""],
    ["Education Journey", data?.educationJourney ?? ""],
    ["Career & Achievements", data?.careerAchievements ?? ""],
    ["Family & Relationships", data?.familyRelationships ?? ""],
    ["Life Challenges & Lessons", data?.lifeChallengesLessons ?? ""],
    ["Dreams, Beliefs & Future Goals", data?.dreamsBeliefsFutureGoals ?? ""]
  ]
    .map(([label, content]) => `${label}: ${content}`)
    .join("\n\n");

  return `Transform the following autobiographical data into a cohesive life story.
Style requested: ${style}.
Writing guidance: ${stylePrompts[style] ?? stylePrompts.simple}

Data:
${sections}

Structure the story with chapters, engaging transitions, and a compelling introduction and conclusion.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { style, data } = await req.json();
  const styleKey = (["emotional", "professional", "simple", "poetic"] as const).includes(style)
    ? style
    : "simple";
  const prompt = buildPrompt(styleKey, data);

  let draft = "";
  const key = process.env.GEMINI_API_KEY;

  if (key) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      draft = result.response.text();
    } catch (error: any) {
      console.error("AI generation error", error);
      draft =
        "Unable to access the AI generator at this time. Please try again later or refine your story manually.";
    }
  } else {
    draft =
      "GEMINI_API_KEY not configured. Please add your API key to generate AI-powered drafts.";
  }

  await connectToDatabase();

  const story = await Story.findOneAndUpdate(
    { userId: session.user.id },
    {
      $push: {
        generatedDrafts: {
          style: styleKey,
          content: draft
        }
      },
      $setOnInsert: { userId: session.user.id }
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ draft, story });
}
