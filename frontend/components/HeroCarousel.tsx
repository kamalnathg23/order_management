"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import CategoryIcon from "./CategoryIcon";

export interface Slide { title: string; text: string; href: string; cta: string; category: string; bg: string }

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);
  if (!n) return null;
  return (
    <div className="carousel" aria-roledescription="carousel">
      {slides.map((s, k) => (
        <div key={s.title} className={`slide${k === i ? " on" : ""}`} style={{ background: s.bg }} aria-hidden={k !== i}>
          <div>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <Link href={s.href} className="cta" tabIndex={k === i ? 0 : -1}>{s.cta}</Link>
          </div>
          <div className="art"><CategoryIcon category={s.category} size={170} /></div>
        </div>
      ))}
      {n > 1 && (
        <>
          <button className="car-btn prev" aria-label="Previous slide" onClick={() => setI((i - 1 + n) % n)}>‹</button>
          <button className="car-btn next" aria-label="Next slide" onClick={() => setI((i + 1) % n)}>›</button>
          <div className="dots">{slides.map((s, k) => <button key={s.title} className={k === i ? "on" : ""} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} />)}</div>
        </>
      )}
    </div>
  );
}
