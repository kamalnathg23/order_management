"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["PLACED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function StatusSelect({ id, status }: { id: number; status: OrderStatus }) {
  const router = useRouter();
  return (
    <select defaultValue={status} disabled={status === "CANCELLED"} onChange={async (e) => {
      try { await api(`/admin/orders/${id}/status`, { method: "PATCH", body: { status: e.target.value } }); router.refresh(); }
      catch (err) { alert((err as Error).message); router.refresh(); }
    }}>
      {STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}
