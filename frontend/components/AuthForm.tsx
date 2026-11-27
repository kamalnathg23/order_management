"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Failed");
    router.push(next ?? (data.role === "ADMIN" ? "/admin" : "/"));
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      {mode === "register" && <input name="name" placeholder="Name" required />}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" minLength={6} required />
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Login" : "Create account"}</button>
    </form>
  );
}
