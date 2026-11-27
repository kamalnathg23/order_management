"use client";
import { useState } from "react";
import { addToCart } from "@/lib/client";

export default function BuyAgain({ product, className = "btn-yellow btn-small" }:
  { product?: { id: number; name: string; price: number; stock: number }; className?: string }) {
  const [added, setAdded] = useState(false);
  if (!product || product.stock === 0) return <span className="muted">Currently unavailable</span>;
  return (
    <button className={className} onClick={() => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1500); }}>
      {added ? "✓ Added to cart" : "↻ Buy it again"}
    </button>
  );
}
