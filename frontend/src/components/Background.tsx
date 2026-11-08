/** Fondo editorial animado: papel, malla de datos y luces pastel. */
export function MeshBackground({ intenso = false }: { intenso?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className={`absolute -left-[12%] -top-[18%] h-[58vh] w-[58vh] rounded-full bg-yellow blur-[90px] blob ${intenso ? "opacity-70" : "opacity-45"}`} />
      <div className={`absolute -right-[10%] top-[8%] h-[52vh] w-[52vh] rounded-full bg-blue blur-[100px] blob-slow ${intenso ? "opacity-75" : "opacity-50"}`} />
      <div className={`absolute bottom-[-20%] left-[28%] h-[46vh] w-[46vh] rounded-full bg-red/[0.09] blur-[95px] blob ${intenso ? "opacity-100" : "opacity-60"}`} />
      <Constellation />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
    </div>
  );
}

function Constellation() {
  const puntos = Array.from({ length: 16 }, (_, i) => ({
    x: 8 + ((i * 37) % 86),
    y: 10 + ((i * 53) % 78),
    r: i % 4 === 0 ? 3.2 : 2,
    color: i % 3 === 0 ? "#e4002b" : i % 3 === 1 ? "#2f5f9e" : "#b08a1e",
  }));
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.22]" viewBox="0 0 100 100" preserveAspectRatio="none">
      {puntos.map((p, i) => {
        const q = puntos[(i + 1) % puntos.length];
        return <line key={`l-${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#141518" strokeWidth="0.08" strokeDasharray="0.8 1.4" />;
      })}
      {puntos.map((p, i) => (
        <circle
          key={`p-${i}`}
          cx={p.x}
          cy={p.y}
          r={p.r / 10}
          fill={p.color}
          className="pulso"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </svg>
  );
}

/** Línea de scan sutil para secciones oscuras. */
export function ScanLine() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="scanline absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-red/10 to-transparent" />
    </div>
  );
}
