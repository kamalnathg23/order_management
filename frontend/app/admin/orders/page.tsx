import StatusSelect from "@/components/StatusSelect";
import { apiGet } from "@/lib/server";
import type { Order } from "@/lib/types";

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

export default async function AdminOrders() {
  const orders = await apiGet<Order[]>("/api/admin/orders");
  return (
    <>
      <h1>All Orders</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Customer</th><th>Date</th><th>Items</th><th>Coupon</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customerEmail}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td>{o.couponCode ?? "—"}</td>
                <td>{inr(o.total)}</td>
                <td><StatusSelect id={o.id} status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
