"use client";

/** Browser calls go through the Next proxy, which attaches the JWT from the httpOnly cookie. */
export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    method: init?.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error ?? data?.message ?? `Request failed (${res.status})`);
  return data as T;
}

export interface CartLine { productId: number; name: string; price: number; quantity: number }
const KEY = "cart";

export function readCart(): CartLine[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function writeCart(lines: CartLine[]) {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  window.dispatchEvent(new Event("cart-changed"));
}
export function addToCart(p: { id: number; name: string; price: number }) {
  const lines = readCart();
  const existing = lines.find((l) => l.productId === p.id);
  if (existing) existing.quantity += 1;
  else lines.push({ productId: p.id, name: p.name, price: Number(p.price), quantity: 1 });
  writeCart(lines);
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n));
