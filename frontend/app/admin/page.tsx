import Link from "next/link";
import CategoryIcon from "@/components/CategoryIcon";
import { RevenueChart, StatusDonut } from "@/components/DashboardCharts";
import { apiGet } from "@/lib/server";
import type { Dashboard, Order, Product } from "@/lib/types";

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n));
const RANGES = [7, 30, 90];
const LOW_STOCK = 10;

const I = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, width: 22, height: 22, viewBox: "0 0 24 24" };
const ICONS = {
  revenue: <svg {...I}><path d="M6 3h12M6 8h12M14 21 6 13h3a5 5 0 0 0 0-10"/></svg>,
  orders: <svg {...I}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>,
  aov: <svg {...I}><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg>,
  customers: <svg {...I}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>,
  coupon: <svg {...I}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/></svg>,
  products: <svg {...I}><path d="M21 8 12 3 3 8l9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/></svg>,
};

function Thumb({ p, size = 28 }: { p?: Product; size?: number }) {
  return <span className="thumb">{p?.imageUrl ? <img src={p.imageUrl} alt="" /> : <CategoryIcon category={p?.category} size={size} />}</span>;
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: dq } = await searchParams;
  const days = RANGES.includes(Number(dq)) ? Number(dq) : 30;
  const [d, orders, products] = await Promise.all([
    apiGet<Dashboard>(`/api/admin/dashboard?days=${days}`),
    apiGet<Order[]>("/api/admin/orders"),
    apiGet<Product[]>("/api/products"),
  ]);
  const byName = new Map(products.map((p) => [p.name, p]));
  const byId = new Map(products.map((p) => [p.id, p]));

  const periodRevenue = d.revenueByDay.reduce((s, r) => s + Number(r.revenue), 0);
  const periodOrders = d.revenueByDay.reduce((s, r) => s + r.orders, 0);
  const cancelled = d.ordersByStatus.find((s) => s.status === "CANCELLED")?.count ?? 0;
  const billable = d.totalOrders - cancelled;
  const aov = billable ? Number(d.totalRevenue) / billable : 0;
  const maxQty = Math.max(1, ...d.topProducts.map((t) => t.quantity));
  const lowStock = products.filter((p) => p.stock < LOW_STOCK).sort((a, b) => a.stock - b.stock);
  const recent = orders.slice(0, 6);

  const kpis = [
    { label: "Total revenue", value: inr(d.totalRevenue), sub: `${inr(periodRevenue)} in last ${days} days`, icon: ICONS.revenue, color: "#2563eb" },
    { label: "Orders", value: d.totalOrders, sub: `${periodOrders} in last ${days} days · ${cancelled} cancelled`, icon: ICONS.orders, color: "#f59e0b" },
    { label: "Avg. order value", value: inr(aov), sub: "Excluding cancelled orders", icon: ICONS.aov, color: "#7c3aed" },
    { label: "Customers", value: d.totalCustomers, sub: "Registered accounts", icon: ICONS.customers, color: "#0891b2" },
    { label: "Coupon savings", value: inr(d.totalDiscount), sub: `${d.couponOrders} orders used a coupon`, icon: ICONS.coupon, color: "#059669" },
    { label: "Products", value: d.totalProducts, sub: `${lowStock.length} low or out of stock`, icon: ICONS.products, color: "#dc2626" },
  ];

  return (
    <>
      <div className="dash-top">
        <div>
          <h1>Seller Dashboard</h1>
          <span className="muted">Overview of sales, orders and inventory</span>
        </div>
        <nav className="seg" aria-label="Date range">
          {RANGES.map((r) => <Link key={r} href={`/admin?days=${r}`} className={r === days ? "on" : ""}>{r} days</Link>)}
        </nav>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="kcard" style={{ "--k": k.color } as React.CSSProperties}>
            <span className="kico">{k.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div className="klabel">{k.label}</div>
              <div className="kval">{k.value}</div>
              <div className="ksub">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="dpanel">
          <div className="dpanel-head"><h3>Revenue &amp; orders: last {days} days</h3></div>
          <RevenueChart data={d.revenueByDay} />
        </section>
        <section className="dpanel">
          <div className="dpanel-head"><h3>Orders by status</h3><Link href="/admin/orders">Manage →</Link></div>
          {d.ordersByStatus.length ? <StatusDonut data={d.ordersByStatus} /> : <p className="muted">No orders yet.</p>}
        </section>
      </div>

      <div className="dash-grid">
        <section className="dpanel">
          <div className="dpanel-head"><h3>Recent orders</h3><Link href="/admin/orders">View all →</Link></div>
          {recent.length === 0 ? <p className="muted">No orders yet.</p> : (
            <div className="table-wrap">
              <table className="dtable">
                <thead><tr><th>Order</th><th>Items</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td><span className="thumbs">{o.items.slice(0, 3).map((i) => <Thumb key={i.productId} p={byId.get(i.productId)} size={18} />)}</span></td>
                      <td>{o.customerEmail}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td><strong>{inr(o.total)}</strong></td>
                      <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dpanel">
          <div className="dpanel-head"><h3>Top selling products</h3></div>
          {d.topProducts.length === 0 ? <p className="muted">No sales yet.</p> : (
            <div className="top-list">
              {d.topProducts.map((t, k) => (
                <div key={t.name} className="top-item">
                  <span className="rank">{k + 1}</span>
                  <Thumb p={byName.get(t.name)} />
                  <div style={{ minWidth: 0 }}>
                    <div className="name">{t.name}</div>
                    <div className="bar"><i style={{ width: `${(t.quantity / maxQty) * 100}%` }} /></div>
                  </div>
                  <div className="rev">{inr(t.revenue)}<small>{t.quantity} sold</small></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="dpanel">
        <div className="dpanel-head"><h3>Inventory alerts</h3><span className="muted">Below {LOW_STOCK} units</span></div>
        {lowStock.length === 0 ? <div className="all-good">✓ All products are well stocked</div> : (
          <div className="kpi-grid" style={{ marginBottom: 0 }}>
            {lowStock.map((p) => (
              <div key={p.id} className="alert-item">
                <Thumb p={p} />
                <div><div style={{ fontWeight: 500 }}>{p.name}</div><span className="muted">{p.category ?? "Uncategorised"}</span></div>
                <span className={`stock-pill ${p.stock === 0 ? "out" : "low"}`}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
