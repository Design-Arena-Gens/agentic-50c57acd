import Link from "next/link";

export default function HomePage() {
  return (
    <main className="layout">
      <section
        className="glass"
        style={{
          padding: "64px",
          display: "grid",
          gap: "32px",
          textAlign: "center"
        }}
      >
        <div>
          <span
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              background: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              fontSize: "0.9rem"
            }}
          >
            Autobiography Data Builder
          </span>
        </div>
        <h1 style={{ fontSize: "3rem", margin: 0 }}>
          Craft your life story with guided structure, AI creativity, and beautiful exports.
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.75, margin: 0 }}>
          Collect meaningful memories, generate immersive drafts in multiple styles, build a visual
          timeline, and export a polished autobiography ready to share with loved ones.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Link href="/register" className="btn">
            Get Started
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      </section>

      <section style={{ marginTop: "64px" }}>
        <h2 className="section-title">Everything you need to narrate your journey</h2>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
          }}
        >
          {[
            {
              title: "Guided Story Builder",
              description:
                "Capture details from childhood to future goals with a structured, reflective flow."
            },
            {
              title: "AI Writing Studio",
              description:
                "Generate drafts in emotional, professional, simple, or poetic styles using Gemini."
            },
            {
              title: "Interactive Timeline",
              description:
                "Plot life events with dates, notes, and images to visualize the chapters that shaped you."
            },
            {
              title: "Elegant Exports",
              description:
                "Personalize covers, fonts, and quotes; export polished PDFs, DOCX files, or share online."
            }
          ].map((feature) => (
            <div key={feature.title} className="card">
              <h3 style={{ marginTop: 0 }}>{feature.title}</h3>
              <p style={{ opacity: 0.75 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
