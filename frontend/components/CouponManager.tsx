"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import type { Coupon } from "@/lib/types";

export default function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const num = (v: string) => (v ? Number(v) : null);
    try {
      await api("/admin/coupons", {
        method: "POST",
        body: {
          code: f.code, type: f.type, value: Number(f.value),
          minOrderAmount: num(f.minOrderAmount), maxDiscount: num(f.maxDiscount),
          usageLimit: num(f.usageLimit),
          validFrom: f.validFrom ? `${f.validFrom}T00:00:00` : null,
          validTo: f.validTo ? `${f.validTo}T23:59:59` : null,
          active: true,
        },
      });
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) { setError((err as Error).message); }
  }

  async function toggle(c: Coupon) {
    await api(`/admin/coupons/${c.id}`, { method: "PUT", body: { ...c, active: !c.active } });
    router.refresh();
  }
  async function remove(id: number) {
    if (!confirm("Delete this coupon?")) return;
    await api(`/admin/coupons/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>New coupon</h3>
        <form onSubmit={create} className="row">
          <input name="code" placeholder="CODE" required />
          <select name="type"><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed</option></select>
          <input name="value" type="number" step="0.01" min="0.01" placeholder="Value" required />
          <input name="minOrderAmount" type="number" step="0.01" placeholder="Min order" />
          <input name="maxDiscount" type="number" step="0.01" placeholder="Max discount" />
          <input name="usageLimit" type="number" min="1" placeholder="Usage limit" />
          <label className="muted">From <input name="validFrom" type="date" /></label>
          <label className="muted">To <input name="validTo" type="date" /></label>
          <button>Create</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min order</th><th>Cap</th><th>Used</th><th>Valid to</th><th>Status</th><th /></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.type}</td>
                <td>{c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}</td>
                <td>{c.minOrderAmount ?? 0}</td>
                <td>{c.maxDiscount ?? "—"}</td>
                <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td>{c.validTo ? new Date(c.validTo).toLocaleDateString() : "—"}</td>
                <td><span className="badge">{c.active ? "Active" : "Inactive"}</span></td>
                <td className="row">
                  <button className="ghost" onClick={() => toggle(c)}>{c.active ? "Disable" : "Enable"}</button>
                  <button className="ghost" onClick={() => remove(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
