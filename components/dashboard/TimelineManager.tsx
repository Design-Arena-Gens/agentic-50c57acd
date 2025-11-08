/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

export interface TimelineEvent {
  _id?: string;
  title: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  category?: string;
}

interface TimelineManagerProps {
  timeline: TimelineEvent[];
  onChange: (timeline: TimelineEvent[]) => void;
}

const categories = [
  "milestone",
  "education",
  "career",
  "family",
  "challenge",
  "travel",
  "creative",
  "other"
];

const emptyEvent: TimelineEvent = {
  title: "",
  description: "",
  date: "",
  imageUrl: "",
  category: "milestone"
};

export default function TimelineManager({ timeline, onChange }: TimelineManagerProps) {
  const [draft, setDraft] = useState<TimelineEvent>(emptyEvent);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const generateId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  };

  const sortedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return da - db;
    });
  }, [timeline]);

  const resetDraft = () => {
    setDraft(emptyEvent);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!draft.title.trim()) return;

    if (editingIndex !== null) {
      const updated = [...timeline];
      updated[editingIndex] = { ...updated[editingIndex], ...draft };
      onChange(updated);
    } else {
      onChange([
        ...timeline,
        {
          ...draft,
          _id: draft._id ?? generateId()
        }
      ]);
    }
    resetDraft();
  };

  const handleEdit = (event: TimelineEvent) => {
    const index = timeline.findIndex((item) => item._id === event._id);
    if (index === -1) return;
    setEditingIndex(index);
    setDraft(timeline[index]);
  };

  const handleDelete = (event: TimelineEvent) => {
    const index = timeline.findIndex((item) => item._id === event._id);
    if (index === -1) return;
    const updated = [...timeline];
    updated.splice(index, 1);
    onChange(updated);
    if (editingIndex === index) {
      resetDraft();
    }
  };

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Life Timeline</h2>
          <p style={{ marginTop: "8px", opacity: 0.7 }}>
            Chronicle defining events with dates, notes, and images to enrich your story structure.
          </p>
        </div>
        <span style={{ opacity: 0.6 }}>{timeline.length} events</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginTop: "16px"
        }}
      >
        <div>
          <label>Title</label>
          <input
            className="input"
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. First Day of College"
          />
        </div>
        <div>
          <label>Date</label>
          <input
            className="input"
            type="date"
            value={draft.date ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div>
          <label>Category</label>
          <select
            className="input"
            value={draft.category ?? "milestone"}
            onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Image URL</label>
          <input
            className="input"
            value={draft.imageUrl ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="Optional: https://"
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label>Notes</label>
          <textarea
            className="input"
            style={{ minHeight: "140px" }}
            value={draft.description ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button className="btn" onClick={handleSave} type="button">
          {editingIndex !== null ? "Update Event" : "Add Event"}
        </button>
        {editingIndex !== null && (
          <button className="btn btn-secondary" onClick={resetDraft} type="button">
            Cancel Edit
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: "32px",
          display: "grid",
          gap: "16px"
        }}
      >
        {sortedTimeline.length === 0 && (
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px dashed rgba(148, 163, 184, 0.4)",
              textAlign: "center",
              opacity: 0.6
            }}
          >
            No events yet. Add milestones to bring your timeline to life.
          </div>
        )}
        {sortedTimeline.map((event) => (
          <div
            key={event._id ?? event.title}
            className="card"
            style={{ background: "rgba(15, 23, 42, 0.65)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: 0 }}>{event.title}</h3>
                <p style={{ marginTop: "4px", opacity: 0.6 }}>
                  {event.date
                    ? new Date(event.date).toLocaleDateString()
                    : "No date"}{" "}
                  ·{" "}
                  {event.category
                    ? event.category.charAt(0).toUpperCase() + event.category.slice(1)
                    : "General"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn btn-secondary" onClick={() => handleEdit(event)} type="button">
                  Edit
                </button>
                <button className="btn btn-secondary" onClick={() => handleDelete(event)} type="button">
                  Delete
                </button>
              </div>
            </div>
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
  );
}
