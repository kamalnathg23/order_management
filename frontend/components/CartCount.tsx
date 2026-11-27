"use client";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/client";

export default function CartCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const update = () => setN(readCart().reduce((s, l) => s + l.quantity, 0));
    update();
    window.addEventListener("cart-changed", update);
    return () => window.removeEventListener("cart-changed", update);
  }, []);
  return <>{n}</>;
}
