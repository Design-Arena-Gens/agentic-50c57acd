import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="layout" style={{ maxWidth: "420px" }}>
      <AuthForm mode="register" />
      <p style={{ marginTop: "16px", textAlign: "center", opacity: 0.7 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#38bdf8" }}>
          Sign in
        </Link>
      </p>
    </main>
  );
}
