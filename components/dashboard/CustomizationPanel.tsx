/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { StoryRecord } from "./DashboardClient";

const fontOptions = [
  {
    label: "Inter",
    value: "inter",
    css: "Inter, sans-serif"
  },
  {
    label: "Playfair Display",
    value: "playfair",
    css: '"Playfair Display", serif'
  },
  {
    label: "Merriweather",
    value: "merriweather",
    css: '"Merriweather", serif'
  },
  {
    label: "Lora",
    value: "lora",
    css: '"Lora", serif'
  },
  {
    label: "Source Serif 4",
    value: "source-serif",
    css: '"Source Serif 4", serif'
  }
] as const;

interface CustomizationPanelProps {
  title: string;
  coverImage: string;
  fontFamily: string;
  favoriteQuotes: string[];
  onChange: (updates: Partial<StoryRecord>) => void;
  onSave: (updates: Partial<StoryRecord>) => void;
}

export default function CustomizationPanel({
  title,
  coverImage,
  fontFamily,
  favoriteQuotes,
  onChange,
  onSave
}: CustomizationPanelProps) {
  const [quoteDraft, setQuoteDraft] = useState("");
  const activeFont =
    fontOptions.find((font) => font.value === fontFamily) ?? fontOptions[0];

  const addQuote = () => {
    if (!quoteDraft.trim()) return;
    onChange({ favoriteQuotes: [...favoriteQuotes, quoteDraft.trim()] });
    setQuoteDraft("");
  };

  const removeQuote = (index: number) => {
    const updated = [...favoriteQuotes];
    updated.splice(index, 1);
    onChange({ favoriteQuotes: updated });
  };

  return (
    <section className="card" style={{ position: "sticky", top: "32px" }}>
      <h2 style={{ marginTop: 0 }}>Customization Studio</h2>
      <p style={{ marginTop: "8px", opacity: 0.7 }}>
        Personalize your autobiography with a unique cover, typography, and meaningful quotes.
      </p>

      <div className="grid" style={{ gap: "16px" }}>
        <div>
          <label>Story Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div>
          <label>Cover Image URL</label>
          <input
            className="input"
            value={coverImage}
            onChange={(e) => onChange({ coverImage: e.target.value })}
            placeholder="https://"
          />
          <p style={{ marginTop: "8px", opacity: 0.6 }}>
            Provide a link to a high-resolution image to use on your exported cover.
          </p>
          {coverImage && (
            <img
              src={coverImage}
              alt="Cover preview"
              style={{
                width: "100%",
                borderRadius: "12px",
                marginTop: "12px",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            />
          )}
        </div>

        <div>
          <label>Typography</label>
          <select
            className="input"
            value={fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <label>Add Favorite Quotes</label>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input
            className="input"
            value={quoteDraft}
            onChange={(e) => setQuoteDraft(e.target.value)}
            placeholder="e.g. The future belongs to those who believe..."
          />
          <button className="btn" type="button" onClick={addQuote} style={{ whiteSpace: "nowrap" }}>
            Add
          </button>
        </div>
        <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
          {favoriteQuotes.map((quote, index) => (
            <div
              key={`${quote}-${index}`}
              className="card"
              style={{ background: "rgba(15,23,42,0.65)" }}
            >
              <p style={{ margin: 0, fontStyle: "italic", fontSize: "0.95rem" }}>&ldquo;{quote}&rdquo;</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: "12px" }}
                onClick={() => removeQuote(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
          {favoriteQuotes.length === 0 && (
            <p style={{ opacity: 0.6 }}>Add quotes to spotlight wisdom throughout your story.</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <div
          className="card"
          style={{
            background: "linear-gradient(160deg, rgba(56,189,248,0.15), rgba(30,64,175,0.15))",
            border: "1px solid rgba(56,189,248,0.35)",
            textAlign: "center",
            padding: "24px"
          }}
        >
          <p style={{ marginTop: 0, marginBottom: "16px", opacity: 0.75 }}>
            Preview style snippet
          </p>
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: "rgba(15,23,42,0.55)",
              fontFamily: activeFont.css
            }}
          >
            <h3 style={{ marginTop: 0 }}>{title}</h3>
            <p style={{ opacity: 0.75 }}>
              This preview reflects your chosen font and title. Exports will apply these same
              styling cues.
            </p>
          </div>
        </div>
      </div>

      <button
        className="btn"
        style={{ marginTop: "24px", width: "100%" }}
        onClick={() =>
          onSave({
            title,
            coverImage,
            fontFamily,
            favoriteQuotes
          })
        }
        type="button"
      >
        Save Customizations
      </button>
    </section>
  );
}
