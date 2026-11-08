import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Filter, Layers, Lightbulb, MapPin, Scale, ShieldCheck, TriangleAlert, Vote, X,
} from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Skeleton, EmptyState } from "../components/ui";
import DualView from "../components/DualView";
import VotoPanel from "../components/VotoPanel";
import { apiGet } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { ProblematicaDetalle, ProblematicaResumen } from "../lib/types";

type Piramide = { nacional: ProblematicaResumen[]; departamental: ProblematicaResumen[]; municipal: ProblematicaResumen[] };

const NIVELES = [
  { id: "nacional", label: "Nacional", ancho: "max-w-5xl", tone: "red" as const },
  { id: "departamental", label: "Departamental", ancho: "max-w-4xl", tone: "yellow" as const },
  { id: "municipal", label: "Municipal", ancho: "max-w-3xl", tone: "blue" as const },
] as const;

export default function Problematicas() {
  const { data, cargando } = useApi<Piramide>("/problematicas");
  const [params, setParams] = useSearchParams();
  const slug = params.get("slug");
  const [detalle, setDetalle] = useState<ProblematicaDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [soloDecisiones, setSoloDecisiones] = useState(params.get("filtro") === "decision");

  useEffect(() => {
    if (!slug) { setDetalle(null); return; }
    setCargandoDetalle(true);
    apiGet<ProblematicaDetalle>(`/problematicas/${slug}`)
      .then(setDetalle)
      .catch(() => setDetalle(null))
      .finally(() => setCargandoDetalle(false));
  }, [slug]);

  function abrir(s: string) {
    setParams((prev) => {
      const n = new URLSearchParams(prev);
      n.set("slug", s);
      return n;
    });
  }
  function cerrar() {
    setParams((prev) => {
      const n = new URLSearchParams(prev);
      n.delete("slug");
      return n;
    });
  }
  function toggleDecisiones() {
    setSoloDecisiones((v) => {
      const n = !v;
      setParams((prev) => {
        const p = new URLSearchParams(prev);
        if (n) p.set("filtro", "decision");
        else p.delete("filtro");
        return p;
      });
      return n;
    });
  }

  const niveles = useMemo(() => {
    if (!data) return [];
    return NIVELES.map((n) => ({
      ...n,
      items: (data[n.id] || []).filter((p) => !soloDecisiones || p.es_decision_activa),
    })).filter((n) => n.items.length > 0);
  }, [data, soloDecisiones]);

  const total = data ? data.nacional.length + data.departamental.length + data.municipal.length : 0;
  const activas = data ? [...data.nacional, ...data.departamental, ...data.municipal].filter((p) => p.es_decision_activa).length : 0;

  return (
    <main>
      <PageHeader
        kicker="Participación · 05"
        title={<>Los problemas del país, <span className="text-red">sin centro.</span></>}
        description="Una pirámide de lo nacional a lo municipal. Cada problemática se puede leer en lenguaje simple o con respaldo técnico. La única interacción es el voto: dos opciones, siempre."
        actions={
          <>
            <Button to="/soluciones" variant="soft"><Lightbulb size={14} /> Ver soluciones</Button>
            <Button to="/metodologia#voto" variant="primary"><Scale size={14} /> Cómo votamos</Button>
          </>
        }
        meta={
          <>
            <Badge tone="red"><TriangleAlert size={11} /> {total} problemáticas</Badge>
            <Badge tone="yellow"><Vote size={11} /> {activas} decisiones activas</Badge>
            <Badge tone="blue"><ShieldCheck size={11} /> 1 dispositivo · 1 voto</Badge>
          </>
        }
      />

      <section className="border-b border-line bg-paper2/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-red" />
            <button
              onClick={toggleDecisiones}
              className={`border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors ${
                soloDecisiones ? "border-red bg-red text-paper2" : "border-line bg-paper text-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {soloDecisiones ? "Mostrando solo decisiones activas" : "Filtrar decisiones activas"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
            <span className="flex items-center gap-1"><Layers size={11} /> Nacional → municipal</span>
            <span className="flex items-center gap-1"><Vote size={11} /> Sin comentarios</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10">
        {cargando && !data && <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>}

        {niveles.map((nivel) => (
          <section key={nivel.id} className="mb-12">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-line" />
              <Badge tone={nivel.tone}>{nivel.label}</Badge>
              <span className="h-px w-10 bg-line" />
            </div>
            <div className={`mx-auto grid gap-3 ${nivel.ancho}`}>
              {nivel.items.map((p) => (
                <Tarjeta key={p.slug} p={p} onClick={() => abrir(p.slug)} />
              ))}
            </div>
          </section>
        ))}

        {!cargando && niveles.length === 0 && (
          <EmptyState title="Sin problemáticas con ese filtro" description="Desactiva el filtro de decisiones activas para ver la pirámide completa." action={<Button variant="soft" onClick={toggleDecisiones}>Ver todas</Button>} />
        )}

        <div id="votos" className="mt-12 border border-line bg-paper2 p-6">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <Kicker className="text-red">Cómo funciona el voto</Kicker>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-ink">Sin centro. Sin cuentas. Sin comentarios.</h2>
              <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted">
                Cada problemática ofrece dos opciones. No hay una tercera vía neutral porque el objetivo es
                obligar a tomar posición. El voto es anónimo y se limita a uno por dispositivo mediante una
                huella hash no identificable. Si los votos quedan parejos, SARCOL muestra la similitud.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { t: "Anónimo", d: "No pedimos cuenta ni contacto.", icono: ShieldCheck },
                { t: "1 por dispositivo", d: "Huella hash, no identificable.", icono: Scale },
                { t: "Dos opciones", d: "Nunca hay una opción neutral.", icono: Vote },
                { t: "Empate visible", d: "Si el país está dividido, se muestra.", icono: TriangleAlert },
              ].map((c) => (
                <div key={c.t} className="border border-line bg-paper p-3">
                  <c.icono size={14} className="text-red" />
                  <div className="mt-2 text-[11.5px] font-semibold text-ink">{c.t}</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {slug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/55 px-4 py-8 backdrop-blur-[2px]"
            onClick={cerrar}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="w-full max-w-3xl border border-line bg-paper2 shadow-[10px_10px_0_0_rgba(20,21,24,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-paper2 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Badge tone="red">Problemática</Badge>
                  {detalle && <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{detalle.nivel} · {detalle.ambito}</span>}
                </div>
                <button onClick={cerrar} className="border border-line p-1.5 text-muted hover:text-ink" aria-label="Cerrar detalle">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                {cargandoDetalle && <div className="space-y-3"><Skeleton className="h-10" /><Skeleton className="h-40" /><Skeleton className="h-32" /></div>}
                {detalle && (
                  <>
                    <h2 className="font-display text-[1.6rem] font-extrabold leading-tight tracking-[-0.025em] text-ink">{detalle.titulo}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="line">{detalle.categoria}</Badge>
                      {detalle.es_decision_activa && <Badge tone="red">Decisión activa</Badge>}
                      {detalle.fecha_decision && <Badge tone="yellow">{detalle.fecha_decision}</Badge>}
                    </div>
                    <div className="mt-5">
                      <DualView simple={detalle.resumen_simple} tecnico={detalle.analisis_tecnico} fuentes={detalle.fuentes} />
                    </div>
                    <div className="mt-6 border-t border-line pt-5">
                      <Kicker className="text-red">Propuesta de solución</Kicker>
                      <p className="mt-2 text-[13px] leading-relaxed text-ink/85">{detalle.solucion_analisis}</p>
                      <div className="mt-3 border-l-2 border-red bg-yellow/25 px-3 py-2 text-[12.5px] leading-relaxed text-ink/80">
                        {detalle.solucion_propuesta}
                      </div>
                    </div>
                    <div className="mt-6" id="votos-detalle">
                      <VotoPanel entidad="problematica" entidadId={detalle.slug} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {detalle.ambito}</span>
                      <span>Slug: {detalle.slug}</span>
                    </div>
                  </>
                )}
                {!cargandoDetalle && !detalle && (
                  <EmptyState title="No se pudo abrir la problemática" description="La API no respondió. Cierra e intenta de nuevo." />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Tarjeta({ p, onClick }: { p: ProblematicaResumen; onClick: () => void }) {
  const total = p.votos_serias + p.votos_buena;
  const pctSeria = total ? Math.round((p.votos_serias / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className="group w-full border border-line bg-paper2 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-red/40 hover:shadow-[5px_5px_0_0_rgba(20,21,24,0.07)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        {p.es_decision_activa && <Badge tone="red">● Decisión activa</Badge>}
        <Badge tone="line">{p.categoria}</Badge>
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{p.ambito}</span>
        <ArrowRight size={13} className="ml-auto text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-red" />
      </div>
      <h3 className="mt-2 font-display text-[1.05rem] font-bold leading-snug text-ink group-hover:text-red">{p.titulo}</h3>
      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted">{p.resumen_simple}</p>
      <div className="mt-3 flex items-center gap-3 border-t border-line pt-2.5">
        <div className="flex-1">
          <div className="flex justify-between font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted">
            <span>Muy seria</span><span>{pctSeria}%</span>
          </div>
          <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-paper3">
            <div className="h-full rounded-full bg-red" style={{ width: `${pctSeria}%` }} />
          </div>
        </div>
        <span className="font-mono text-[9px] tabular-nums text-muted">{total} votos</span>
      </div>
    </button>
  );
}
