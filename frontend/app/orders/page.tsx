import Link from "next/link";
import BuyAgain from "@/components/BuyAgain";
import CancelOrder from "@/components/CancelOrder";
import CategoryIcon from "@/components/CategoryIcon";
import { apiGet, getSession } from "@/lib/server";
import type { Order, OrderStatus, Product } from "@/lib/types";

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n));
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const STEPS: OrderStatus[] = ["PLACED", "PAID", "SHIPPED", "DELIVERED"];
const STEP_LABEL: Record<string, string> = { PLACED: "Ordered", PAID: "Payment confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered" };
const HEADLINE: Record<OrderStatus, string> = {
  PLACED: "Order confirmed", PAID: "Payment received, preparing to ship", SHIPPED: "On the way",
  DELIVERED: "Delivered", CANCELLED: "Cancelled",
};
const TABS = [
  { key: "", label: "All orders", match: () => true },
  { key: "active", label: "Active", match: (o: Order) => ["PLACED", "PAID", "SHIPPED"].includes(o.status) },
  { key: "delivered", label: "Delivered", match: (o: Order) => o.status === "DELIVERED" },
  { key: "cancelled", label: "Cancelled", match: (o: Order) => o.status === "CANCELLED" },
];

type Params = { placed?: string; tab?: string; q?: string };

function Tracker({ status }: { status: OrderStatus }) {
  const idx = STEPS.indexOf(status);
  return (
    <div className="tracker" aria-label={`Order progress: ${status}`}>
      {STEPS.map((s, i) => (
        <div key={s} className={`tstep${i <= idx ? " done" : ""}${i === idx ? " current" : ""}`}>
          <span className="dot">{i <= idx ? "✓" : ""}</span>{STEP_LABEL[s]}
        </div>
      ))}
    </div>
  );
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const [orders, products, session] = await Promise.all([
    apiGet<Order[]>("/api/orders/me"), apiGet<Product[]>("/api/products"), getSession(),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const tab = TABS.find((t) => t.key === (sp.tab ?? "")) ?? TABS[0];
  const q = sp.q?.trim().toLowerCase();
  const shown = orders.filter((o) => tab.match(o) &&
    (!q || String(o.id) === q.replace("#", "") || o.items.some((i) => i.productName.toLowerCase().includes(q))));
  const tabHref = (key: string) => { const p = new URLSearchParams(); if (key) p.set("tab", key); if (sp.q) p.set("q", sp.q); const s = p.toString(); return s ? `/orders?${s}` : "/orders"; };

  return (
    <div className="orders-wrap">
      <div className="orders-top">
        <h1>Your Orders</h1>
        <form className="order-search" action="/orders">
          {sp.tab && <input type="hidden" name="tab" value={sp.tab} />}
          <input name="q" defaultValue={sp.q} placeholder="Search by product or order #" aria-label="Search orders" />
          <button>Search</button>
        </form>
      </div>

      {sp.placed && (
        <div className="placed-banner">
          <span className="tick">✓</span>
          <div><strong>Order #{sp.placed} placed. Thank you{session?.name ? `, ${session.name}` : ""}!</strong>
            <div className="muted">You&apos;ll find its status and progress below.</div></div>
        </div>
      )}

      <nav className="tabs">
        {TABS.map((t) => (
          <Link key={t.key} href={tabHref(t.key)} className={t === tab ? "on" : ""}>
            {t.label}<span className="n">{orders.filter(t.match).length}</span>
          </Link>
        ))}
      </nav>

      {shown.length === 0 && (
        <div className="cart-empty">
          <h2 style={{ margin: "0 0 6px" }}>{orders.length === 0 ? "You haven't placed any orders yet" : "No orders match"}</h2>
          <p className="muted">{orders.length === 0 ? "Everything you order will show up here." : "Try another tab or search term."}</p>
          <Link href="/" className="btn">Start shopping</Link>
        </div>
      )}

      {shown.map((o) => (
        <article key={o.id} className="ocard">
          <div className="ocard-head">
            <div><span>Order placed</span><b>{fmtDate(o.createdAt)}</b></div>
            <div><span>Total</span><b>{inr(o.total)}</b></div>
            <div><span>Items</span><b>{o.items.reduce((s, i) => s + i.quantity, 0)}</b></div>
            {o.couponCode && <div><span>Coupon</span><b>{o.couponCode}</b></div>}
            <div className="oid"><span>Order #</span><b>{o.id}</b></div>
          </div>
          <div className="ocard-body">
            <div>
              <p className={`ostatus ${o.status}`}>{HEADLINE[o.status]}</p>
              <span className="muted">
                {o.status === "CANCELLED" ? "This order was cancelled and any items were returned to stock."
                  : o.status === "DELIVERED" ? "Your package was delivered."
                  : "We'll update the status here as your order progresses."}
              </span>
              {o.status !== "CANCELLED" && <Tracker status={o.status} />}
              <div className="oitems" style={o.status === "CANCELLED" ? { marginTop: 16 } : undefined}>
                {o.items.map((i) => {
                  const p = byId.get(i.productId);
                  return (
                    <div key={i.productId} className="oitem">
                      <div className="oitem-img">
                        {p?.imageUrl ? <img src={p.imageUrl} alt={i.productName} /> : <CategoryIcon category={p?.category} size={40} />}
                      </div>
                      <div>
                        <h4><Link href={`/?q=${encodeURIComponent(i.productName)}`}>{i.productName}</Link></h4>
                        <span className="muted">Qty {i.quantity} · {inr(i.unitPrice)} each · <strong style={{ color: "var(--text)" }}>{inr(i.subtotal)}</strong></span>
                        <div className="row"><BuyAgain product={p} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="oactions">
              {o.status === "PLACED" && <CancelOrder id={o.id} />}
              <Link href="/" className="btn btn-outline">Continue shopping</Link>
              <div className="ototals">
                <div><span>Subtotal</span><span>{inr(o.subtotal)}</span></div>
                {Number(o.discount) > 0 && <div><span>Coupon</span><span className="green">−{inr(o.discount)}</span></div>}
                <div><span>Delivery</span><span className="green">FREE</span></div>
                <div className="grand"><span>Order total</span><span>{inr(o.total)}</span></div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
