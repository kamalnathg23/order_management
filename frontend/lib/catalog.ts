import "server-only";
import { API_URL } from "./server";
import type { Product } from "./types";

/** Cached product list for chrome (header categories); pages use live SSR fetches. */
export async function getCatalog(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products`, { next: { revalidate: 60 } });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export const categoriesOf = (ps: Product[]) =>
  [...new Set(ps.map((p) => p.category).filter((c): c is string => !!c))].sort();

export const discountPct = (p: Product) =>
  p.mrp && Number(p.mrp) > Number(p.price) ? Math.round((1 - Number(p.price) / Number(p.mrp)) * 100) : 0;
