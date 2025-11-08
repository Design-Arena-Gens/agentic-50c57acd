import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";

function buildContent(story: any) {
  if (!story) {
    return {
      title: "My Autobiography",
      cover: "No story found."
    };
  }

  const draft =
    story.selectedDraft ||
    story.generatedDrafts?.[story.generatedDrafts.length - 1]?.content ||
    "";

  const sections: string[] = [];

  sections.push(`# ${story.title ?? "My Autobiography"}`);

  if (story.favoriteQuotes?.length) {
    sections.push("Favorite Quotes:");
    story.favoriteQuotes.forEach((q: string) => sections.push(`- ${q}`));
  }

  if (draft) {
    sections.push(draft);
  } else {
    const data = story.data ?? {};
    sections.push("Personal Information:");
    const info = data.personalInformation ?? {};
    sections.push(
      `Name: ${info.fullName ?? ""}\nDOB: ${info.dob ?? ""}\nBirthplace: ${info.birthplace ?? ""}\nBackground: ${info.background ?? ""}`
    );
    sections.push("\nChildhood Memories:\n" + (data.childhoodMemories ?? ""));
    sections.push("\nEducation Journey:\n" + (data.educationJourney ?? ""));
    sections.push("\nCareer & Achievements:\n" + (data.careerAchievements ?? ""));
    sections.push("\nFamily & Relationships:\n" + (data.familyRelationships ?? ""));
    sections.push("\nLife Challenges & Lessons:\n" + (data.lifeChallengesLessons ?? ""));
    sections.push("\nDreams, Beliefs & Future Goals:\n" + (data.dreamsBeliefsFutureGoals ?? ""));
  }

  if (story.timeline?.length) {
    sections.push("\nTimeline of Major Events:\n");
    story.timeline
      .sort((a: any, b: any) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
      })
      .forEach((event: any) => {
        const date = event.date ? new Date(event.date).toLocaleDateString() : "Unknown date";
        sections.push(`${date} - ${event.title}\n${event.description ?? ""}\n`);
      });
  }

  return {
    title: story.title ?? "My Autobiography",
    content: sections.join("\n\n")
  };
}

const pdfFontMap: Record<string, string> = {
  inter: "Helvetica",
  playfair: "Times-Roman",
  merriweather: "Times-Roman",
  lora: "Times-Italic",
  "source-serif": "Times-Roman"
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const story = (await Story.findOne({ userId: session.user.id }).lean()) as any;
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }
  const { title, content } = buildContent(story);

  const { default: PDFDocument } = await import("pdfkit");
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const fontKey = (story.fontFamily as string | undefined) ?? "inter";
  const font = pdfFontMap[fontKey] ?? "Helvetica";

  doc.font(font).fontSize(22).fillColor("#0ea5e9").text(title, { align: "center" });
  doc.moveDown();
  doc
    .fontSize(12)
    .fillColor("#ffffff")
    .text(content, {
      lineGap: 6
    });

  doc.end();

  await new Promise((resolve) => doc.on("end", resolve));

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "_")}.pdf"`
    }
  });
}
