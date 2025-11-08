"use client";

import { useMemo, useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import StoryForm, { StoryFormData } from "./StoryForm";
import TimelineManager, { TimelineEvent } from "./TimelineManager";
import DraftManager, { Draft } from "./DraftManager";
import CustomizationPanel from "./CustomizationPanel";
import ExportActions from "./ExportActions";
import Link from "next/link";

export interface StoryRecord {
  _id?: string;
  data?: StoryFormData;
  timeline?: TimelineEvent[];
  generatedDrafts?: Draft[];
  selectedDraft?: string;
  title?: string;
  coverImage?: string;
  fontFamily?: string;
  favoriteQuotes?: string[];
  sharedSlug?: string;
}

interface DashboardClientProps {
  initialStory: StoryRecord | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function DashboardClient({ initialStory, user }: DashboardClientProps) {
  const [story, setStory] = useState<StoryRecord>(initialStory ?? {});
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const drafts = story.generatedDrafts ?? [];

  const shareUrl = useMemo(() => {
    if (!story.sharedSlug) return null;
    return `https://agentic-50c57acd.vercel.app/share/${story.sharedSlug}`;
  }, [story.sharedSlug]);

  const syncStory = async (payload: Partial<StoryRecord>) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body = { ...story, ...payload } as Record<string, any>;
      delete body._id;
      delete body.userId;

      const res = await fetch("/api/story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save changes");
      }

      const { story: updated } = await res.json();
      setStory(updated);
      setSuccess("Changes saved");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (data: StoryFormData) => {
    setStory((prev) => ({ ...prev, data }));
  };

  const handleTimelineChange = (timeline: TimelineEvent[]) => {
    setStory((prev) => ({ ...prev, timeline }));
  };

  const handleCustomizationChange = (updates: Partial<StoryRecord>) => {
    setStory((prev) => ({ ...prev, ...updates }));
  };

  const triggerAI = async (style: Draft["style"]) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/story/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ style, data: story.data })
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to generate story");
        }
        const { story: updated } = await res.json();
        setStory(updated);
        setSuccess("AI draft generated");
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const setSelectedDraft = (content: string) => {
    setStory((prev) => ({ ...prev, selectedDraft: content }));
  };

  const handleShare = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/story/share", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to create shareable link");
      }
      const { slug } = await res.json();
      setStory((prev) => ({ ...prev, sharedSlug: slug }));
      setSuccess("Shareable link ready");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="layout" style={{ paddingTop: "32px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px"
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Welcome, {user.name || user.email}</h1>
          <p style={{ marginTop: "8px", opacity: 0.7 }}>
            Build your autobiography with guided prompts, AI storytelling, and elegant exports.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {user.role === "admin" && (
            <Link href="/admin" className="btn btn-secondary">
              Admin Dashboard
            </Link>
          )}
          <button className="btn btn-secondary" onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </button>
        </div>
      </header>

      {(error || success || saving || isPending) && (
        <div style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.18)",
                color: "#fca5a5"
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(34, 197, 94, 0.18)",
                color: "#bbf7d0"
              }}
            >
              {success}
            </div>
          )}
          {(saving || isPending) && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.18)",
                color: "#bae6fd"
              }}
            >
              Saving changes...
            </div>
          )}
        </div>
      )}

      <section className="grid" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
        <div className="grid">
          <StoryForm
            data={story.data ?? ({} as StoryFormData)}
            onChange={handleFormChange}
            onSave={(payload) => {
              handleFormChange(payload);
              syncStory({ data: payload });
            }}
          />

          <TimelineManager
            timeline={story.timeline ?? []}
            onChange={(updated) => {
              handleTimelineChange(updated);
              syncStory({ timeline: updated });
            }}
          />

          <DraftManager
            drafts={drafts}
            selectedDraft={story.selectedDraft ?? ""}
            onSelect={(content) => {
              setSelectedDraft(content);
              syncStory({ selectedDraft: content });
            }}
            onGenerate={triggerAI}
            generating={isPending}
          />
        </div>

        <div className="grid">
          <CustomizationPanel
            title={story.title ?? "My Autobiography"}
            coverImage={story.coverImage ?? ""}
            fontFamily={story.fontFamily ?? "inter"}
            favoriteQuotes={story.favoriteQuotes ?? []}
            onChange={(updates) => {
              handleCustomizationChange(updates);
            }}
            onSave={(payload) => {
              handleCustomizationChange(payload);
              syncStory(payload);
            }}
          />

          <ExportActions
            shareUrl={shareUrl}
            onShare={handleShare}
            selectedDraft={story.selectedDraft ?? ""}
          />
        </div>
      </section>
    </main>
  );
}
