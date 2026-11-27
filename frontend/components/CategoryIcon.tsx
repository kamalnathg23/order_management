const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export default function CategoryIcon({ category, size = 64 }: { category?: string; size?: number }) {
  const s = { width: size, height: size, viewBox: "0 0 24 24", ...P };
  switch (category) {
    case "Laptops": return <svg {...s}><rect x="4" y="5" width="16" height="10" rx="1.5"/><path d="M2 19h20l-2-4H4z"/></svg>;
    case "Monitors": return <svg {...s}><rect x="2" y="3" width="20" height="13" rx="1.5"/><path d="M8 21h8M12 16v5"/></svg>;
    case "Audio": return <svg {...s}><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="1.5"/><rect x="17" y="14" width="5" height="7" rx="1.5"/></svg>;
    case "Mobiles": return <svg {...s}><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>;
    case "Wearables": return <svg {...s}><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 9.5V12l1.5 1.5"/></svg>;
    case "Accessories": return <svg {...s}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>;
    default: return <svg {...s}><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/></svg>;
  }
}
