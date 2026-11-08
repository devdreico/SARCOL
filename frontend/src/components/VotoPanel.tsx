import { useEffect, useState } from "react";
import { Check, Lock, Scale } from "lucide-react";
import { apiGet, apiPost, huellaDispositivo } from "../lib/api";

export type OpcionVoto = { id: string; label: string; color: string; icono?: string };

const LOCALES = {
  problematica: [
    { id: "seria", label: "Es una problemática MUY SERIA", color: "#e4002b" },
    { id: "buena", label: "No es seria / es algo bueno para el país", color: "#1f7a5c" },
  ],
  solucion: [
    { id: "acuerdo", label: "Acuerdo con la propuesta", color: "#2f5f9e" },
    { id: "desacuerdo", label: "Desacuerdo con la propuesta", color: "#e4002b" },
  ],
} as const;

type EntidadVoto = keyof typeof LOCALES;

/** Panel de voto imparcial: SIN CENTRO (no hay opción neutra), anónimo, 1 por dispositivo.
 *  Si los votos quedan parejos, se muestra la similitud — esa es la imparcialidad. */
export default function VotoPanel({
  entidad,
  entidadId,
}: {
  entidad: EntidadVoto;
  entidadId: string;
}) {
  const [huella, setHuella] = useState<string | null>(null);
  const [resumen, setResumen] = useState<{
    seria: number; buena: number; acuerdo: number; desacuerdo: number; total: number; voto_previo: string | null;
  } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opciones = LOCALES[entidad];

  async function cargar() {
    if (!huella) return;
    try {
      const r = await apiGet<typeof resumen>(
        `/votos/resultado?entidad=${entidad}&entidad_id=${entidadId}&huella=${huella}`,
      );
      setResumen(r);
    } catch {
      setResumen(null);
    }
  }

  useEffect(() => {
    huellaDispositivo().then((h) => setHuella(h));
  }, []);
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huella, entidadId]);

  async function votar(opcion: string) {
    if (!huella || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const r = await apiPost<{ aceptado: boolean; mensaje: string; resumen: typeof resumen }>("/votos", {
        entidad, entidad_id: entidadId, opcion, huella,
      });
      setResumen(r.resumen);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al votar");
    } finally {
      setEnviando(false);
    }
  }

  const conteo = (id: string) =>
    !resumen ? 0 : id === "seria" ? resumen.seria : id === "buena" ? resumen.buena : id === "acuerdo" ? resumen.acuerdo : resumen.desacuerdo;
  const total = resumen?.total || 0;
  const yaVoto = !!resumen?.voto_previo;

  const p1 = total > 0 ? conteo(opciones[0].id) / total : 0;
  const dividido = total >= 10 && Math.abs(p1 - 0.5) <= 0.05;

  return (
    <div className="rounded-[2px] border border-line bg-paper2 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted">
          <Scale size={12} className="text-red" /> Voto ciudadano · sin centro
        </div>
        <div className="font-mono text-[10px] tabular-nums text-muted">
          {total.toLocaleString("es-CO")} {total === 1 ? "voto" : "votos"}
        </div>
      </div>

      {!yaVoto ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {opciones.map((o) => (
            <button
              key={o.id}
              onClick={() => votar(o.id)}
              disabled={enviando}
              className="group flex items-center justify-between gap-2 rounded-[2px] border border-line bg-paper px-3.5 py-3 text-left text-[12px] font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-ink/40 disabled:opacity-50"
            >
              <span>{o.label}</span>
              <span className="h-3 w-3 shrink-0 rounded-full border-2 border-line2 transition-colors group-hover:border-transparent">
                <span className="block h-full w-full rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ background: o.color }} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-red">
            <Lock size={11} /> Ya votaste: {resumen?.voto_previo === "seria" ? "MUY SERIA" : resumen?.voto_previo === "buena" ? "NO ES SERIA" : resumen?.voto_previo === "acuerdo" ? "ACUERDO" : "DESACUERDO"}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {opciones.map((o) => {
              const n = conteo(o.id);
              const pct = total ? Math.round((n / total) * 100) : 0;
              const esMiVoto = resumen?.voto_previo === o.id;
              return (
                <div key={o.id} className={`rounded-[2px] border px-3.5 py-3 ${esMiVoto ? "border-red/40 bg-yellow/20" : "border-line bg-paper"}`}>
                  <div className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="flex items-center gap-1.5 text-ink/90">
                      {esMiVoto && <Check size={11} className="text-red" />} {o.label}
                    </span>
                    <span className="ml-2 font-mono font-bold tabular-nums" style={{ color: o.color }}>{pct}%</span>
                  </div>
                  <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-paper3">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: o.color }} />
                  </div>
                  <div className="mt-1 text-right font-mono text-[9.5px] tabular-nums text-muted">{n.toLocaleString("es-CO")}</div>
                </div>
              );
            })}
          </div>
          {dividido && (
            <div className="mt-3 border-l-2 border-red bg-red/5 px-3 py-2 text-[11.5px] leading-relaxed text-red">
              LA CIUDADANÍA ESTÁ DIVIDIDA — los votos quedaron casi parejos. SARCOL muestra la similitud: esta es la imparcialidad.
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-2 text-[12px] text-red">{error}</div>}
      <p className="mt-3 font-mono text-[9px] leading-relaxed text-muted">
        1 voto por dispositivo · anónimo · sin comentarios · sin contacto. Para votar de nuevo tendrías que usar otro dispositivo.
      </p>
    </div>
  );
}
