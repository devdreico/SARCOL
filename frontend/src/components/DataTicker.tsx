import { Link } from "react-router-dom";
import { useLive } from "./LiveProvider";
import { formatear } from "../lib/format";

export default function DataTicker() {
  const { pulso } = useLive();
  const items = pulso?.items?.length ? pulso.items : [];
  if (items.length === 0) return null;

  const contenido = (
    <>
      {items.map((i) => (
        <Link
          key={i.key}
          to={`/estado-actual?indicador=${i.key}`}
          className="group flex shrink-0 items-center gap-2 border-r border-paper/15 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-paper/70 transition-colors hover:text-yellow"
        >
          <span className="h-1 w-1 rounded-full bg-red" />
          <span className="text-paper/45">{i.nombre}</span>
          <span className="font-semibold text-paper group-hover:text-yellow">{formatear(i.valor, i.formato)}</span>
          {i.fecha_valor && <span className="text-paper/30">· {i.fecha_valor}</span>}
        </Link>
      ))}
    </>
  );

  return (
    <div className="relative overflow-hidden border-y border-ink bg-ink" aria-label="Cinta de datos en vivo">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent" />
      <div className="marquee-track" aria-hidden="true">
        {contenido}
        {contenido}
      </div>
      <div className="sr-only">
        {items.map((i) => `${i.nombre}: ${formatear(i.valor, i.formato)}`).join(". ")}
      </div>
    </div>
  );
}
