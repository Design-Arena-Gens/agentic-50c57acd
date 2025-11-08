import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";
import { Document, Packer, Paragraph, TextRun } from "docx";

const docxFontMap: Record<string, string> = {
  inter: "Inter",
  playfair: "Playfair Display",
  merriweather: "Merriweather",
  lora: "Lora",
  "source-serif": "Source Serif 4"
};

function buildParagraphs(story: any) {
  if (!story) {
    return [new Paragraph("No story found.")];
  }

  const paragraphs: Paragraph[] = [];
  const pushHeading = (text: string) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 32,
            color: "0EA5E9"
          })
        ]
      })
    );
  };

  const pushText = (text: string) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text, size: 24 })]
      })
    );
  };

  pushHeading(story.title ?? "My Autobiography");

  if (story.favoriteQuotes?.length) {
    pushHeading("Favorite Quotes");
    story.favoriteQuotes.forEach((quote: string) => {
      pushText(`• ${quote}`);
    });
  }

  const draft =
    story.selectedDraft ||
    story.generatedDrafts?.[story.generatedDrafts.length - 1]?.content;

  if (draft) {
    draft.split("\n\n").forEach((block: string) => pushText(block));
  } else if (story.data) {
    const data = story.data;
    pushHeading("Personal Information");
    const pi = data.personalInformation ?? {};
    pushText(
      `Name: ${pi.fullName ?? ""}\nDOB: ${pi.dob ?? ""}\nBirthplace: ${pi.birthplace ?? ""}\nBackground: ${pi.background ?? ""}`
    );
    pushHeading("Childhood Memories");
    pushText(data.childhoodMemories ?? "");
    pushHeading("Education Journey");
    pushText(data.educationJourney ?? "");
    pushHeading("Career & Achievements");
    pushText(data.careerAchievements ?? "");
    pushHeading("Family & Relationships");
    pushText(data.familyRelationships ?? "");
    pushHeading("Life Challenges & Lessons");
    pushText(data.lifeChallengesLessons ?? "");
    pushHeading("Dreams, Beliefs & Future Goals");
    pushText(data.dreamsBeliefsFutureGoals ?? "");
  }

  if (story.timeline?.length) {
    pushHeading("Timeline of Events");
    story.timeline
      .sort((a: any, b: any) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
      })
      .forEach((event: any) => {
        const date = event.date ? new Date(event.date).toLocaleDateString() : "Unknown date";
        pushText(`${date} - ${event.title}\n${event.description ?? ""}`);
      });
  }

  return paragraphs;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const story = (await Story.findOne({ userId: session.user.id }).lean()) as any;

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const fontKey = (story.fontFamily as string | undefined) ?? "inter";
  const fontName = docxFontMap[fontKey] ?? "Inter";

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: fontName
          }
        }
      ]
    },
    sections: [
      {
        children: buildParagraphs(story)
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const title = (story?.title ?? "My Autobiography").replace(/\s+/g, "_");

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${title}.docx"`
    }
  });
}
