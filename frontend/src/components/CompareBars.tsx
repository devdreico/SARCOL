/** Barras de comparación de Colombia contra países de referencia. */
export default function CompareBars({
  comparativas,
  formato,
}: {
  comparativas: { pais: string; iso?: string; valor: number }[];
  formato: (v: number) => string;
}) {
  if (!comparativas || comparativas.length < 2) return null;
  const max = Math.max(...comparativas.map((c) => Math.abs(c.valor))) || 1;
  const ordenadas = [...comparativas].sort((a, b) => b.valor - a.valor);
  return (
    <div className="space-y-2">
      <div className="kicker">Comparación internacional</div>
      {ordenadas.map((c) => {
        const esColombia = c.iso === "COL";
        return (
          <div key={c.iso || c.pais} className="flex items-center gap-2">
            <div className={`w-24 truncate font-mono text-[10.5px] ${esColombia ? "font-semibold text-red" : "text-muted"}`}>
              {c.pais}
            </div>
            <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-paper3">
              <div
                className={`h-full rounded-full ${esColombia ? "bg-red" : "bg-blue2/50"}`}
                style={{ width: `${Math.max(1.5, (Math.abs(c.valor) / max) * 100)}%` }}
              />
            </div>
            <div className={`w-24 text-right font-mono text-[10.5px] tabular-nums ${esColombia ? "font-semibold text-ink" : "text-muted"}`}>
              {formato(c.valor)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
