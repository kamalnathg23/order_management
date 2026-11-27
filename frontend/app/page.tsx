import Link from "next/link";
import { Suspense } from "react";
import CategoryIcon from "@/components/CategoryIcon";
import HeroCarousel, { type Slide } from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import { categoriesOf, discountPct } from "@/lib/catalog";
import { apiGet } from "@/lib/server";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic"; // SSR on every request (live stock + filters)

type Params = { q?: string; cat?: string; sort?: string; price?: string; off?: string; stock?: string };

const PRICE_RANGES: Record<string, { label: string; min: number; max: number }> = {
  u1k: { label: "Under ₹1,000", min: 0, max: 1000 },
  "1-5k": { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  "5-20k": { label: "₹5,000 – ₹20,000", min: 5000, max: 20000 },
  "20k+": { label: "Over ₹20,000", min: 20000, max: Infinity },
};
const OFF_STEPS = [10, 25, 40];
const SLIDE_BG = [
  "linear-gradient(110deg,#0b1f4b 0%,#1d4ed8 100%)",
  "linear-gradient(110deg,#4c1d95 0%,#db2777 100%)",
  "linear-gradient(110deg,#064e3b 0%,#0891b2 100%)",
];

function href(cur: Params, change: Partial<Params>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...cur, ...change })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

function applyFilters(all: Product[], sp: Params) {
  const q = sp.q?.trim().toLowerCase();
  const range = sp.price ? PRICE_RANGES[sp.price] : undefined;
  const minOff = Number(sp.off) || 0;
  const list = all.filter((p) =>
    (!q || `${p.name} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase().includes(q)) &&
    (!sp.cat || p.category === sp.cat) &&
    (!range || (Number(p.price) >= range.min && Number(p.price) < range.max)) &&
    discountPct(p) >= minOff &&
    (!sp.stock || p.stock > 0));
  const sorters: Record<string, (a: Product, b: Product) => number> = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    discount: (a, b) => discountPct(b) - discountPct(a),
  };
  return sp.sort && sorters[sp.sort] ? [...list].sort(sorters[sp.sort]) : list;
}

export default async function Home({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const all = await apiGet<Product[]>("/api/products");
  const cats = categoriesOf(all);
  const filtering = Object.values(sp).some(Boolean);

  if (!filtering) {
    const deals = [...all].filter((p) => p.stock > 0 && discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 10);
    const slides: Slide[] = cats.slice(0, 3).map((c, k) => {
      const best = Math.max(0, ...all.filter((p) => p.category === c).map(discountPct));
      return {
        title: best ? `${c}: up to ${best}% off` : `Explore ${c}`,
        text: `Top picks in ${c.toLowerCase()} with fast, free delivery.`,
        href: `/?cat=${encodeURIComponent(c)}`, cta: "Shop now", category: c, bg: SLIDE_BG[k % SLIDE_BG.length],
      };
    });
    return (
      <>
        <HeroCarousel slides={slides} />
        <div className="cat-tiles">
          {cats.map((c) => (
            <Link key={c} href={`/?cat=${encodeURIComponent(c)}`} className="cat-tile">
              <span className="ico"><CategoryIcon category={c} size={34} /></span>{c}
            </Link>
          ))}
        </div>
        {deals.length > 0 && (
          <section className="section">
            <div className="section-head"><h2>Deals of the Day</h2><Link href="/?sort=discount">See all deals →</Link></div>
            <div className="scroller">{deals.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </section>
        )}
        {cats.map((c) => {
          const items = all.filter((p) => p.category === c);
          return (
            <section key={c} className="section">
              <div className="section-head"><h2>Best of {c}</h2><Link href={`/?cat=${encodeURIComponent(c)}`}>View all →</Link></div>
              <div className="scroller">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            </section>
          );
        })}
        {all.some((p) => !p.category) && (
          <section className="section">
            <div className="section-head"><h2>More products</h2></div>
            <div className="pgrid">{all.filter((p) => !p.category).map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </section>
        )}
      </>
    );
  }

  const results = applyFilters(all, sp);
  const box = (on: boolean) => <span className="box">{on ? "✓" : ""}</span>;
  const active = [
    sp.q && `“${sp.q}”`, sp.cat, sp.price && PRICE_RANGES[sp.price]?.label,
    sp.off && `${sp.off}%+ off`, sp.stock && "In stock",
  ].filter(Boolean) as string[];

  return (
    <div className="listing">
      <aside className="filters">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Filters</strong><Link href="/" className="muted">Clear all</Link>
        </div>
        <div className="group">
          <h3>Category</h3>
          {cats.map((c) => (
            <Link key={c} href={href(sp, { cat: sp.cat === c ? undefined : c })} className={sp.cat === c ? "on" : ""}>{box(sp.cat === c)}{c}</Link>
          ))}
        </div>
        <div className="group">
          <h3>Price</h3>
          {Object.entries(PRICE_RANGES).map(([k, r]) => (
            <Link key={k} href={href(sp, { price: sp.price === k ? undefined : k })} className={sp.price === k ? "on" : ""}>{box(sp.price === k)}{r.label}</Link>
          ))}
        </div>
        <div className="group">
          <h3>Discount</h3>
          {OFF_STEPS.map((d) => (
            <Link key={d} href={href(sp, { off: sp.off === String(d) ? undefined : String(d) })} className={sp.off === String(d) ? "on" : ""}>{box(sp.off === String(d))}{d}% or more</Link>
          ))}
        </div>
        <div className="group">
          <h3>Availability</h3>
          <Link href={href(sp, { stock: sp.stock ? undefined : "1" })} className={sp.stock ? "on" : ""}>{box(!!sp.stock)}Exclude out of stock</Link>
        </div>
      </aside>
      <section>
        <div className="results-bar">
          <div className="row">
            <span><b>{results.length}</b> result{results.length === 1 ? "" : "s"}</span>
            <div className="chips">{active.map((a) => <span key={a} className="chip">{a}</span>)}</div>
          </div>
          <Suspense><SortSelect /></Suspense>
        </div>
        {results.length === 0
          ? <div className="empty"><h3>No results found</h3><p>Try a different search or <Link href="/" style={{ color: "var(--accent)" }}>clear filters</Link>.</p></div>
          : <div className="pgrid">{results.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
      </section>
    </div>
  );
}
