/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";

interface SharePageProps {
  params: { slug: string };
}

export default async function SharePage({ params }: SharePageProps) {
  await connectToDatabase();
  const story = (await Story.findOne({ sharedSlug: params.slug }).lean()) as any;
  if (!story) {
    notFound();
  }

  const draft =
    story.selectedDraft ||
    story.generatedDrafts?.[story.generatedDrafts.length - 1]?.content ||
    "";

  const fontCssMap: Record<string, string> = {
    inter: "Inter, sans-serif",
    playfair: '"Playfair Display", serif',
    merriweather: '"Merriweather", serif',
    lora: '"Lora", serif',
    "source-serif": '"Source Serif 4", serif'
  };

  const fontFamily = fontCssMap[story.fontFamily ?? "inter"] ?? "Inter, sans-serif";

  return (
    <main className="layout" style={{ maxWidth: "860px" }}>
      <article
        className="card"
        style={{
          background: "rgba(15,23,42,0.65)",
          borderRadius: "18px",
          padding: "48px",
          fontFamily
        }}
      >
        {story.coverImage && (
          <img
            src={story.coverImage}
            alt={story.title}
            style={{ width: "100%", borderRadius: "16px", marginBottom: "32px" }}
          />
        )}
        <h1 style={{ marginTop: 0, fontSize: "2.6rem" }}>{story.title}</h1>
        {story.favoriteQuotes?.length > 0 && (
          <section style={{ marginBottom: "32px" }}>
            <h3 style={{ opacity: 0.75 }}>Favorite Quotes</h3>
            <ul style={{ listStyle: "disc", paddingLeft: "20px", lineHeight: 1.6 }}>
              {story.favoriteQuotes.map((quote: string, index: number) => (
                <li key={`${quote}-${index}`} style={{ marginBottom: "8px" }}>
                  <em>&ldquo;{quote}&rdquo;</em>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section style={{ whiteSpace: "pre-wrap", lineHeight: 1.75, fontSize: "1.05rem" }}>
          {draft || "This story has not been generated yet."}
        </section>

        {story.timeline?.length > 0 && (
          <section style={{ marginTop: "48px" }}>
            <h2>Timeline of Life Events</h2>
            <div style={{ display: "grid", gap: "24px", marginTop: "16px" }}>
              {story.timeline
                .sort((a: any, b: any) => {
                  const da = a.date ? new Date(a.date).getTime() : 0;
                  const db = b.date ? new Date(b.date).getTime() : 0;
                  return da - db;
                })
                .map((event: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(15,23,42,0.45)"
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>{event.title}</h3>
                    <p style={{ margin: "4px 0", opacity: 0.65 }}>
                      {event.date ? new Date(event.date).toLocaleDateString() : "No date"} ·{" "}
                      {event.category ?? "Event"}
                    </p>
                    <p style={{ marginTop: "12px", opacity: 0.8 }}>{event.description}</p>
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          marginTop: "12px",
                          border: "1px solid rgba(255,255,255,0.08)"
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
