"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  return (
    <label className="row">Sort by
      <select value={params.get("sort") ?? "relevance"} onChange={(e) => {
        const p = new URLSearchParams(params);
        p.set("sort", e.target.value);
        router.push(`${path}?${p}`);
      }}>
        <option value="relevance">Relevance</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="discount">Discount</option>
      </select>
    </label>
  );
}
