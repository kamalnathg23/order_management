"use client";
import { useState } from "react";
import { addToCart } from "@/lib/client";

export default function AddToCart({ product }: { product: { id: number; name: string; price: number; stock: number } }) {
  const [added, setAdded] = useState(false);
  return (
    <button className={`btn-cart${added ? " added" : ""}`} disabled={product.stock === 0}
      onClick={() => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1200); }}>
      {product.stock === 0 ? "Currently unavailable" : added ? "✓ Added to cart" : "Add to cart"}
    </button>
  );
}
