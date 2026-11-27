import { NextResponse } from "next/server";
import { API_URL } from "@/lib/server";

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action !== "login" && action !== "register") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const upstream = await fetch(`${API_URL}/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return NextResponse.json({ error: data.error ?? data.message ?? "Authentication failed" }, { status: upstream.status });

  const res = NextResponse.json({ name: data.name, role: data.role });
  const opts = {
    httpOnly: true, sameSite: "lax" as const, path: "/",
    secure: process.env.NODE_ENV === "production", maxAge: Math.floor(data.expiresInMs / 1000),
  };
  res.cookies.set("token", data.token, opts);
  // role/name are only used for UI + redirects; the API re-verifies the JWT on every call.
  res.cookies.set("role", data.role, opts);
  res.cookies.set("name", data.name, opts);
  return res;
}
