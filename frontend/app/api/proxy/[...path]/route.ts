import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/server";

async function handle(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const token = (await cookies()).get("token")?.value;
  const search = new URL(req.url).search;
  const hasBody = !["GET", "HEAD"].includes(req.method);

  const upstream = await fetch(`${API_URL}/api/${path.join("/")}${search}`, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });
  return new NextResponse(upstream.status === 204 ? null : await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
