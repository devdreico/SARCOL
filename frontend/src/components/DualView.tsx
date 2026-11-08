import { useState } from "react";
import { ExternalLink, Lightbulb, ScrollText, ShieldCheck } from "lucide-react";

type Fuente = { nombre: string; url: string };

/** El corazón de SARCOL: cada dato tiene DOS versiones.
 *  SIMPLE — lenguaje natural sin tecnicismos.
 *  TÉCNICO — respaldo argumentativo completo + fuentes con enlace. */
export default function DualView({
  simple,
  tecnico,
  fuentes,
  nota,
}: {
  simple: string;
  tecnico: string;
  fuentes?: Fuente[] | null;
  nota?: string;
}) {
  const [vista, setVista] = useState<"simple" | "tecnico">("simple");
  return (
    <div className="w-full">
      <div className="mb-3 inline-flex rounded-[2px] border border-line bg-paper p-1">
        <button
          onClick={() => setVista("simple")}
          className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] transition-all ${
            vista === "simple" ? "bg-ink text-paper" : "text-muted hover:text-ink"
          }`}
        >
          <Lightbulb size={12} /> Lenguaje simple
        </button>
        <button
          onClick={() => setVista("tecnico")}
          className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] transition-all ${
            vista === "tecnico" ? "bg-red text-paper2" : "text-muted hover:text-ink"
          }`}
        >
          <ScrollText size={12} /> Respaldo completo
        </button>
      </div>

      {vista === "simple" ? (
        <p className="text-[14.5px] leading-relaxed text-ink/90">{simple}</p>
      ) : (
        <div>
          <p className="text-[13.5px] leading-relaxed text-ink/80">{tecnico}</p>
          {nota && (
            <p className="mt-3 flex items-start gap-2 border-l-2 border-yellow2 bg-yellow/30 px-3 py-2 text-[11.5px] leading-relaxed text-ink/75">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-red" /> {nota}
            </p>
          )}
          {fuentes && fuentes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {fuentes.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-paper px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted transition-colors hover:border-red/40 hover:text-red"
                >
                  <ExternalLink size={10} /> {f.nombre}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
