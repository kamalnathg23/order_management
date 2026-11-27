import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "./types";

export const API_URL = process.env.API_URL ?? "http://localhost:8080";

export async function getSession(): Promise<{ token: string; role: Role; name: string } | null> {
  const c = await cookies();
  const token = c.get("token")?.value;
  if (!token) return null;
  return { token, role: (c.get("role")?.value as Role) ?? "CUSTOMER", name: c.get("name")?.value ?? "" };
}

/** Server-side fetch to the Spring API, forwarding the JWT from the httpOnly cookie. */
export async function apiGet<T>(path: string): Promise<T> {
  const session = await getSession();
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: session ? { Authorization: `Bearer ${session.token}` } : {},
  });
  if (res.status === 401 || res.status === 403) redirect("/login");
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
