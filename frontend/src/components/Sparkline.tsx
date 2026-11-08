/** Línea de tiempo (sparkline) en SVG puro — sin dependencias pesadas. */
export default function Sparkline({
  serie,
  color = "#e4002b",
  width = 220,
  height = 54,
}: {
  serie: { x: number | string; y: number }[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!serie || serie.length < 3) return null;
  const w = width;
  const h = height;
  const ys = serie.map((s) => s.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const rango = max - min || 1;
  const pts = serie.map((s, i) => {
    const x = (i / (serie.length - 1)) * (w - 8) + 4;
    const y = h - 7 - ((s.y - min) / rango) * (h - 18);
    return [x, y] as const;
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full shrink-0">
      <path d={area} fill={color} opacity="0.09" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} stroke="#fffdf8" strokeWidth="1.2" />
      <text x="4" y="9" fontSize="8.5" fill="#6d6a62" fontFamily="IBM Plex Mono, monospace">{serie[0].x}</text>
      <text x={w - 4} y="9" fontSize="8.5" fill="#6d6a62" textAnchor="end" fontFamily="IBM Plex Mono, monospace">{serie[serie.length - 1].x}</text>
    </svg>
  );
}
