"use client";

import { useState } from "react";
import Link from "next/link";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastStoryUpdate: string;
  timelineCount: number;
  draftCount: number;
}

const roleOptions = ["user", "admin"];

export default function AdminDashboardClient({ initialUsers }: { initialUsers: AdminUserRecord[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateRole = async (id: string, role: string) => {
    setLoadingId(id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, role })
      });
      if (!res.ok) {
        throw new Error("Failed to update role");
      }
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)));
      setMessage("Role updated");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm("Remove this user and their story data?")) return;
    setLoadingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setMessage("User removed");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="layout">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ marginTop: "8px", opacity: 0.7 }}>
            Monitor user activity, story progress, and manage access roles.
          </p>
        </div>
        <Link href="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </header>

      {message && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(56, 189, 248, 0.18)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            color: "#e0f2fe"
          }}
        >
          {message}
        </div>
      )}

      <section className="card" style={{ marginTop: "32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: "16px",
            fontWeight: 600,
            opacity: 0.8,
            marginBottom: "16px"
          }}
        >
          <span>User</span>
          <span>Role</span>
          <span>Timeline</span>
          <span>Drafts</span>
          <span>Actions</span>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: "16px",
                alignItems: "center",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.65)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div>
                <strong>{user.name || user.email}</strong>
                <p style={{ margin: "4px 0", opacity: 0.65 }}>{user.email}</p>
                <p style={{ margin: 0, opacity: 0.45, fontSize: "0.85rem" }}>
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </p>
                <p style={{ margin: 0, opacity: 0.45, fontSize: "0.85rem" }}>
                  Updated{" "}
                  {user.lastStoryUpdate ? new Date(user.lastStoryUpdate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <select
                  className="input"
                  value={user.role}
                  disabled={loadingId === user.id}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </div>
              <span>{user.timelineCount}</span>
              <span>{user.draftCount}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => removeUser(user.id)}
                  disabled={loadingId === user.id}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p style={{ opacity: 0.65 }}>No users yet.</p>}
        </div>
      </section>
    </main>
  );
}
