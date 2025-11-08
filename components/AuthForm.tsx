 "use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState)
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to register");
        }
      }

      const res = await signIn("credentials", {
        email: formState.email,
        password: formState.password,
        redirect: false
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: "8px" }}>
        {mode === "login" ? "Welcome Back" : "Create Your Account"}
      </h2>
      <p style={{ marginTop: 0, marginBottom: "24px", opacity: 0.7 }}>
        {mode === "login"
          ? "Sign in to continue crafting your life story."
          : "Start building your guided autobiography journey."}
      </p>

      {mode === "register" && (
        <div style={{ marginBottom: "16px" }}>
          <label>Name</label>
          <input
            type="text"
            required
            value={formState.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="input"
          />
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label>Email</label>
        <input
          type="email"
          required
          value={formState.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="input"
        />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label>Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={formState.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#fca5a5"
          }}
        >
          {error}
        </div>
      )}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Processing..." : mode === "login" ? "Login" : "Register"}
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginTop: "12px", width: "100%" }}
        onClick={signInWithGoogle}
      >
        Continue with Google
      </button>
    </form>
  );
}
