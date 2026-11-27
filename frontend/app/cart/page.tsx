"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryIcon from "@/components/CategoryIcon";
import { api, money, readCart, writeCart, type CartLine } from "@/lib/client";
import type { Order, Product } from "@/lib/types";

interface Preview { code: string; discount: number; total: number }
interface Row { line: CartLine; product?: Product }

const MAX_QTY = 10;

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Preview | null>(null);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLines(readCart());
    // Live prices/stock/images come from the API, not from what was stored when the item was added.
    api<Product[]>("/products").then(setCatalog).catch(() => setCatalog([]));
  }, []);

  const rows: Row[] = useMemo(
    () => lines.map((line) => ({ line, product: catalog?.find((p) => p.id === line.productId) })),
    [lines, catalog]);
  const buyable = rows.filter((r) => r.product && r.product.stock > 0);
  const itemCount = buyable.reduce((s, r) => s + r.line.quantity, 0);
  const subtotal = buyable.reduce((s, r) => s + Number(r.product!.price) * r.line.quantity, 0);
  const mrpTotal = buyable.reduce((s, r) => s + Number(r.product!.mrp ?? r.product!.price) * r.line.quantity, 0);
  const mrpSavings = mrpTotal - subtotal;
  const couponOff = coupon ? Number(coupon.discount) : 0;
  const total = subtotal - couponOff;
  const overStock = buyable.some((r) => r.line.quantity > r.product!.stock);

  function update(next: CartLine[]) {
    setLines(next); writeCart(next);
    if (coupon) { setCoupon(null); setMsg({ type: "error", text: "Cart changed. Please re-apply your coupon." }); }
  }
  const setQty = (id: number, q: number) =>
    update(q <= 0 ? lines.filter((l) => l.productId !== id) : lines.map((l) => (l.productId === id ? { ...l, quantity: q } : l)));

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const r = await api<Preview>("/coupons/validate", { method: "POST", body: { code, subtotal } });
      setCoupon(r);
      setMsg({ type: "ok", text: `“${r.code}” applied. You saved ${money(r.discount)}` });
    } catch (err) {
      setCoupon(null);
      const m = (err as Error).message;
      setMsg({ type: "error", text: m.includes("401") ? "Please log in to apply coupons." : m });
    }
  }

  async function checkout() {
    setBusy(true); setMsg(null);
    try {
      const order = await api<Order>("/orders", {
        method: "POST",
        body: { items: buyable.map((r) => ({ productId: r.line.productId, quantity: r.line.quantity })), couponCode: coupon?.code ?? null },
      });
      writeCart(rows.filter((r) => !buyable.includes(r)).map((r) => r.line)); // keep only unavailable items
      router.push(`/orders?placed=${order.id}`);
      router.refresh();
    } catch (err) {
      const m = (err as Error).message;
      if (m.includes("401")) router.push("/login?next=/cart");
      else setMsg({ type: "error", text: m });
    } finally { setBusy(false); }
  }

  if (lines.length === 0) {
    return (
      <div className="cart-empty">
        <div className="ico">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
        </div>
        <h2 style={{ margin: "0 0 6px" }}>Your cart is empty</h2>
        <p className="muted">Looks like you haven&apos;t added anything yet. Explore today&apos;s deals!</p>
        <Link href="/" className="btn">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-items">
        <div className="cart-head">
          <h1>Shopping Cart</h1>
          <span className="muted">{lines.length} item{lines.length === 1 ? "" : "s"}</span>
        </div>
        {rows.map(({ line, product: p }) => {
          const price = Number(p?.price ?? line.price);
          const mrp = p?.mrp ? Number(p.mrp) : 0;
          const off = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
          const unavailable = catalog !== null && (!p || p.stock === 0);
          const maxQty = Math.min(MAX_QTY, p?.stock ?? MAX_QTY);
          return (
            <div key={line.productId} className="cline" style={unavailable ? { opacity: .6 } : undefined}>
              <div className="cline-img">
                {p?.imageUrl ? <img src={p.imageUrl} alt={line.name} /> : <CategoryIcon category={p?.category} size={56} />}
              </div>
              <div className="cline-info">
                <h3><Link href={`/?q=${encodeURIComponent(line.name)}`}>{line.name}</Link></h3>
                {p?.description && <span className="muted">{p.description}</span>}
                {unavailable ? <span className="warn">Currently unavailable, so it won&apos;t be ordered</span>
                  : p && p.stock < 10 ? <span className="warn">Only {p.stock} left in stock</span>
                  : <span className="in-stock">In stock</span>}
                <span className="muted">FREE delivery</span>
                <div className="cline-actions">
                  <div className="stepper" aria-label={`Quantity for ${line.name}`}>
                    <button aria-label="Decrease" onClick={() => setQty(line.productId, line.quantity - 1)}>{line.quantity === 1 ? "🗑" : "−"}</button>
                    <span>{line.quantity}</span>
                    <button aria-label="Increase" disabled={unavailable || line.quantity >= maxQty} onClick={() => setQty(line.productId, line.quantity + 1)}>+</button>
                  </div>
                  <button className="link-btn" onClick={() => setQty(line.productId, 0)}>Remove</button>
                </div>
                {p && !unavailable && line.quantity > p.stock && <span className="warn">Only {p.stock} available. Reduce the quantity to continue.</span>}
              </div>
              <div className="cline-price">
                <span className="now">{money(price * line.quantity)}</span>
                {off > 0 && <><span className="mrp">{money(mrp * line.quantity)}</span><span className="off">{off}% off</span></>}
                {line.quantity > 1 && <div className="muted">{money(price)} each</div>}
              </div>
            </div>
          );
        })}
        <div className="cart-subtotal">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"}): <strong>{money(subtotal)}</strong></div>
      </section>

      <aside className="summary">
        <div className="panel coupon-box">
          {coupon ? (
            <div className="coupon-applied">
              <span>🏷 {coupon.code} applied</span>
              <button className="link-btn" onClick={() => { setCoupon(null); setMsg(null); setCode(""); }}>Remove</button>
            </div>
          ) : (
            <form className="coupon-form" onSubmit={applyCoupon}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code" aria-label="Coupon code" />
              <button className="ghost" disabled={!code || subtotal === 0}>Apply</button>
            </form>
          )}
          {msg && <p className={msg.type} style={{ margin: "8px 0 0" }}>{msg.text}</p>}
        </div>

        <div className="panel">
          <h2>Price details</h2>
          <div className="price-rows">
            <div><span>Price ({itemCount} item{itemCount === 1 ? "" : "s"})</span><span>{money(mrpTotal)}</span></div>
            {mrpSavings > 0 && <div><span>Discount</span><span className="green">−{money(mrpSavings)}</span></div>}
            {coupon && <div><span>Coupon ({coupon.code})</span><span className="green">−{money(couponOff)}</span></div>}
            <div><span>Delivery charges</span><span className="green">FREE</span></div>
            <div className="total"><span>Total amount</span><span>{money(total)}</span></div>
          </div>
          {mrpSavings + couponOff > 0 && <p className="savings">You will save {money(mrpSavings + couponOff)} on this order 🎉</p>}
        </div>

        <button className="place-order" onClick={checkout} disabled={busy || itemCount === 0 || overStock || catalog === null}>
          {busy ? "Placing order…" : `Place order · ${money(total)}`}
        </button>
        <div className="trust">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          Safe and secure checkout. Cancel anytime before shipping.
        </div>
      </aside>
    </div>
  );
}
