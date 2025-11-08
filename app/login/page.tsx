import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="layout" style={{ maxWidth: "420px" }}>
      <AuthForm mode="login" />
      <p style={{ marginTop: "16px", textAlign: "center", opacity: 0.7 }}>
        New here?{" "}
        <Link href="/register" style={{ color: "#38bdf8" }}>
          Create an account
        </Link>
      </p>
    </main>
  );
}
