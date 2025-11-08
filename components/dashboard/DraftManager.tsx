"use client";

import { useEffect, useMemo, useState } from "react";

export type DraftStyle = "emotional" | "professional" | "simple" | "poetic";

export interface Draft {
  style: DraftStyle;
  content: string;
  createdAt?: string;
}

const styleLabels: Record<DraftStyle, string> = {
  emotional: "Emotional",
  professional: "Professional",
  simple: "Simple",
  poetic: "Poetic"
};

interface DraftManagerProps {
  drafts: Draft[];
  selectedDraft: string;
  onSelect: (content: string) => void;
  onGenerate: (style: DraftStyle) => void;
  generating: boolean;
}

export default function DraftManager({
  drafts,
  selectedDraft,
  onSelect,
  onGenerate,
  generating
}: DraftManagerProps) {
  const [editorValue, setEditorValue] = useState(selectedDraft);

  useEffect(() => {
    setEditorValue(selectedDraft);
  }, [selectedDraft]);

  const latestByStyle = useMemo(() => {
    const map = new Map<DraftStyle, Draft>();
    drafts.forEach((draft) => map.set(draft.style, draft));
    return map;
  }, [drafts]);

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>AI Story Studio</h2>
          <p style={{ marginTop: "8px", opacity: 0.7 }}>
            Generate and refine expertly written drafts based on your collected memories.
          </p>
        </div>
        <span style={{ opacity: 0.6 }}>{drafts.length} drafts</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginTop: "16px"
        }}
      >
        {(Object.keys(styleLabels) as DraftStyle[]).map((style) => (
          <button
            key={style}
            className="btn btn-secondary"
            style={{
              border: latestByStyle.has(style)
                ? "1px solid rgba(56, 189, 248, 0.8)"
                : "1px solid transparent"
            }}
            disabled={generating}
            onClick={() => onGenerate(style)}
            type="button"
          >
            Generate {styleLabels[style]}
          </button>
        ))}
      </div>
      {generating && (
        <p style={{ marginTop: "10px", opacity: 0.7 }}>Generating fresh draft. This may take a moment.</p>
      )}

  <div
        style={{
          display: "grid",
          gap: "12px",
          marginTop: "24px"
        }}
      >
        {drafts.map((draft, index) => (
          <button
            key={index}
            className="btn btn-secondary"
            style={{
              justifyContent: "space-between",
              border:
                selectedDraft === draft.content
                  ? "1px solid rgba(56, 189, 248, 0.85)"
                  : "1px solid transparent"
            }}
            onClick={() => onSelect(draft.content)}
            type="button"
          >
            <span>
              {styleLabels[draft.style]} ·{" "}
              {draft.createdAt ? new Date(draft.createdAt).toLocaleString() : "recent"}
            </span>
            <span style={{ opacity: 0.6 }}>Use draft</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "24px" }}>
        <label>Active Draft</label>
        <textarea
          className="input"
          style={{ minHeight: "320px" }}
          value={editorValue ?? ""}
          onChange={(e) => setEditorValue(e.target.value)}
          placeholder="Your AI-generated autobiography draft will appear here. Feel free to refine it."
        />
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <button className="btn" type="button" onClick={() => onSelect(editorValue)}>
            Save Refinements
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setEditorValue(selectedDraft)}
          >
            Revert Changes
          </button>
        </div>
      </div>
    </section>
  );
}
