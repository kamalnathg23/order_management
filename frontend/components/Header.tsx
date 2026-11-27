import Link from "next/link";
import { getSession } from "@/lib/server";
import { categoriesOf, getCatalog } from "@/lib/catalog";
import CartCount from "./CartCount";

export default async function Header() {
  const [s, catalog] = await Promise.all([getSession(), getCatalog()]);
  const cats = categoriesOf(catalog);
  return (
    <header className="hdr">
      <div className="hdr-main">
        <Link href="/" className="logo"><span className="logo-mark">S</span>Shop<i>OMS</i></Link>
        <form action="/" className="searchbar" role="search">
          <select name="cat" aria-label="Category" defaultValue="">
            <option value="">All</option>
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input name="q" placeholder="Search for products, brands and more" aria-label="Search" />
          <button aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
        </form>
        <span className="hdr-spacer" />
        {s ? (
          <Link href="/orders" className="hdr-link"><small>Hello, {s.name}</small><b>Returns &amp; Orders</b></Link>
        ) : (
          <Link href="/login" className="hdr-link"><small>Hello, sign in</small><b>Account &amp; Lists</b></Link>
        )}
        <Link href="/cart" className="hdr-link hdr-cart">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <span className="count"><CartCount /></span>Cart
        </Link>
        {s && <form action="/api/logout" method="post"><button className="hdr-logout">Logout</button></form>}
      </div>
      <nav className="hdr-sub" aria-label="Categories">
        <Link href="/">☰ All</Link>
        <Link href="/?sort=discount">Today&apos;s Deals</Link>
        {cats.map((c) => <Link key={c} href={`/?cat=${encodeURIComponent(c)}`}>{c}</Link>)}
        {s?.role === "ADMIN" && (
          <>
            <Link href="/admin" className="admin">Admin Dashboard</Link>
            <Link href="/admin/orders">Manage Orders</Link>
            <Link href="/admin/coupons">Coupons</Link>
          </>
        )}
      </nav>
    </header>
  );
}
