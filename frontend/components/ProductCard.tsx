import { discountPct } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import AddToCart from "./AddToCart";
import CategoryIcon from "./CategoryIcon";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function ProductCard({ p }: { p: Product }) {
  const off = discountPct(p);
  return (
    <article className="pcard">
      <div className="pmedia">
        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <CategoryIcon category={p.category} size={72} />}
        {off >= 30 && <span className="ptag">Deal</span>}
      </div>
      <div className="pbody">
        {p.category && <span className="pcat">{p.category}</span>}
        <h3 className="ptitle">{p.name}</h3>
        {p.description && <p className="pdesc">{p.description}</p>}
        <div className="pprice">
          <span className="now">{inr(p.price)}</span>
          {off > 0 && <><span className="mrp">{inr(p.mrp!)}</span><span className="off">{off}% off</span></>}
        </div>
        <span className="pmeta"><b>FREE delivery</b></span>
        {p.stock === 0 ? <span className="pstock-out">Out of stock</span>
          : p.stock < 10 ? <span className="pstock-low">Only {p.stock} left in stock</span> : null}
        <span className="pspace" />
        <AddToCart product={p} />
      </div>
    </article>
  );
}
