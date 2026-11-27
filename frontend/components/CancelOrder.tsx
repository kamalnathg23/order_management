"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export default function CancelOrder({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button className="btn-danger" disabled={busy} onClick={async () => {
      if (!confirm(`Cancel order #${id}? Items will be returned to stock.`)) return;
      setBusy(true);
      try { await api(`/orders/${id}/cancel`, { method: "POST" }); router.refresh(); }
      catch (e) { alert((e as Error).message); setBusy(false); }
    }}>{busy ? "Cancelling…" : "Cancel order"}</button>
  );
}
