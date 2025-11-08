"use client";

import { useState } from "react";

interface ExportActionsProps {
  shareUrl: string | null;
  onShare: () => Promise<void> | void;
  selectedDraft: string;
}

export default function ExportActions({ shareUrl, onShare, selectedDraft }: ExportActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const downloadFile = async (endpoint: string, filename: string) => {
    setLoading(endpoint);
    setMessage(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error("Export failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Export ready");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    setLoading("share");
    setMessage(null);
    try {
      await onShare();
      setMessage("Share link created");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(null);
    }
  };

  const copyShare = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setMessage("Share link copied");
  };

  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>Export & Share</h2>
      <p style={{ marginTop: "8px", opacity: 0.7 }}>
        Download polished formats or share a read-only version of your autobiography online.
      </p>

      {selectedDraft.length === 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(248, 250, 252, 0.08)",
            color: "#e2e8f0",
            marginBottom: "20px"
          }}
        >
          Tip: Select or generate a draft to craft the narrative used for exports.
        </div>
      )}

      <div style={{ display: "grid", gap: "12px" }}>
        <button
          className="btn"
          onClick={() => downloadFile("/api/export/pdf", "autobiography.pdf")}
          type="button"
          disabled={loading !== null}
        >
          {loading === "/api/export/pdf" ? "Preparing PDF..." : "Download PDF"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => downloadFile("/api/export/docx", "autobiography.docx")}
          type="button"
          disabled={loading !== null}
        >
          {loading === "/api/export/docx" ? "Preparing DOCX..." : "Download DOCX"}
        </button>
        <button className="btn btn-secondary" onClick={handleShare} type="button" disabled={loading !== null}>
          {loading === "share" ? "Creating link..." : "Create Shareable Link"}
        </button>
      </div>

      {shareUrl && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(56, 189, 248, 0.18)",
            border: "1px solid rgba(56, 189, 248, 0.35)"
          }}
        >
          <p style={{ marginTop: 0, marginBottom: "8px", fontWeight: 600 }}>Shareable link</p>
          <p style={{ marginTop: 0, marginBottom: "12px", wordBreak: "break-all" }}>{shareUrl}</p>
          <button className="btn btn-secondary" onClick={copyShare} type="button">
            Copy to Clipboard
          </button>
        </div>
      )}

      {message && (
        <p style={{ marginTop: "16px", opacity: 0.75, textAlign: "center" }}>{message}</p>
      )}
    </section>
  );
}
