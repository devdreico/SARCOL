import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, ChevronDown, Clock, ExternalLink, Filter, Landmark, Scale, Search, ShieldCheck,
} from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Skeleton, EmptyState } from "../components/ui";
import DualView from "../components/DualView";
import { useApi } from "../lib/useApi";
import type { Era, EventoHistoria } from "../lib/types";
import { normalizar } from "../lib/format";

const IMPACTO: Record<string, { label: string; tone: "green" | "red" | "yellow" | "blue" | "line" }> = {
  positivo: { label: "Beneficio · positivo", tone: "green" },
  negativo: { label: "Daño · negativo", tone: "red" },
  mixto: { label: "Mixto · en debate", tone: "yellow" },
  estructural: { label: "Hito · estructural", tone: "blue" },
};

const RIGOR_VALOR: Record<string, number> = { MEDIO: 1, "TÉCNICO ALTO": 2, EXTREMO: 3 };

export default function Historia() {
  const { data, cargando, error } = useApi<{ eras: Era[] }>("/historia");
  const [params, setParams] = useSearchParams();
  const [eraId, setEraId] = useState(params.get("era") || "1810-1900");
  const [impacto, setImpacto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  const eras = data?.eras || [];
  const era = eras.find((e) => e.id === eraId) || eras[0];

  useEffect(() => {
    const ev = params.get("evento");
    if (!ev || !eras.length) return;
    const encontrado = eras.flatMap((e) => e.eventos).find((e) => e.slug === ev);
    if (encontrado) {
      setEraId(encontrado.era);
      setAbiertos((prev) => new Set(prev).add(ev));
      const t = window.setTimeout(() => {
        document.getElementById(`ev-${ev}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 450);
      return () => window.clearTimeout(t);
    }
  }, [params, eras]);

  function elegirEra(id: string) {
    setEraId(id);
    setParams((prev) => {
      const n = new URLSearchParams(prev);
      n.set("era", id);
      n.delete("evento");
      return n;
    });
  }

  const eventos = useMemo(() => {
    if (!era) return [];
    const q = normalizar(busqueda);
    return era.eventos.filter((e) => {
      const okImp = !impacto || e.impacto === impacto;
      const okQ = !q || normalizar(`${e.titulo} ${e.categoria} ${e.administracion} ${e.responsables} ${e.descripcion_simple}`).includes(q);
      return okImp && okQ;
    });
  }, [era, impacto, busqueda]);

  const categorias = useMemo(() => era ? [...new Set(era.eventos.map((e) => e.categoria))] : [], [era]);

  return (
    <main>
      <PageHeader
        kicker="Memoria pública · 04"
        title={<>Colombia, <span className="text-red">año por año.</span></>}
        description="No hay un relato único. Cada hecho tiene fecha, administración, responsables, impacto y fuentes. El rigor aumenta a medida que nos acercamos al presente."
        actions={
          <>
            <Button to="/metodologia#fuentes" variant="soft"><ShieldCheck size={14} /> Cómo verificamos</Button>
            <Button to="/datos-abiertos#descargas" variant="primary">Descargar historia <ArrowRight size={14} /></Button>
          </>
        }
        meta={
          <>
            <Badge tone="red"><Landmark size={11} /> {eras.reduce((a, e) => a + e.eventos.length, 0)} hechos</Badge>
            <Badge tone="blue">3 eras · rigor escalonado</Badge>
            <Badge tone="yellow">Sin relato único</Badge>
          </>
        }
      />

      <section className="border-b border-line bg-paper2/50">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="grid gap-3 md:grid-cols-3">
            {eras.map((e) => {
              const activa = e.id === eraId;
              const nivel = RIGOR_VALOR[e.rigor] || 1;
              return (
                <button
                  key={e.id}
                  onClick={() => elegirEra(e.id)}
                  className={`group border p-5 text-left transition-all ${
                    activa ? "border-red bg-paper2 shadow-[5px_5px_0_0_rgba(228,0,43,0.12)]" : "border-line bg-paper2/70 hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`font-display text-[15px] font-bold ${activa ? "text-red" : "text-ink"}`}>{e.nombre}</div>
                      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{e.rango}</div>
                    </div>
                    <Badge tone={activa ? "red" : "line"}>{e.eventos.length} hechos</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">Rigor</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((n) => (
                        <span key={n} className={`h-1.5 w-6 ${n <= nivel ? (activa ? "bg-red" : "bg-ink/40") : "bg-line"}`} />
                      ))}
                    </div>
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">{e.rigor}</span>
                  </div>
                </button>
              );
            })}
            {!eras.length && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          {era && <p className="mt-4 max-w-4xl text-[12.5px] leading-relaxed text-muted">{era.descripcion}</p>}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-col gap-3 border border-line bg-paper2 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 border border-line bg-paper px-3 py-2 lg:w-80">
            <Search size={14} className="text-red" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar un hecho, un responsable…"
              className="w-full bg-transparent text-[12px] text-ink outline-none placeholder:text-muted/70"
              aria-label="Buscar en la historia"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={12} className="mr-1 text-muted" />
            {["", ...Object.keys(IMPACTO)].map((k) => (
              <button
                key={k}
                onClick={() => setImpacto(k)}
                className={`border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors ${
                  impacto === k ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {k === "" ? "Todos" : IMPACTO[k].label}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{eventos.length} sucesos</span>
        </div>

        {cargando && !data && <div className="mt-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>}
        {error && !data && <div className="mt-6"><EmptyState title="No se pudo cargar la historia" description="Revisa la bitácora o reintenta en unos segundos." /></div>}

        {era && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Kicker>{era.nombre}</Kicker>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{era.rango}</span>
              </div>
              <div className="relative">
                <div className="absolute bottom-0 left-[17px] top-0 w-px bg-line" />
                <div className="space-y-4">
                  {eventos.map((ev) => (
                    <EventoCard
                      key={ev.slug}
                      ev={ev}
                      abierto={abiertos.has(ev.slug)}
                      onToggle={() => setAbiertos((prev) => {
                        const n = new Set(prev);
                        if (n.has(ev.slug)) n.delete(ev.slug);
                        else n.add(ev.slug);
                        return n;
                      })}
                    />
                  ))}
                </div>
              </div>
              {eventos.length === 0 && (
                <EmptyState title="Sin hechos con ese filtro" description="Prueba con otro impacto o limpia la búsqueda." />
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
              <div className="border border-line bg-paper2 p-4">
                <Kicker>Categorías de la era</Kicker>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categorias.map((c) => (
                    <span key={c} className="border border-line bg-paper px-2 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{c}</span>
                  ))}
                </div>
              </div>
              <div className="border border-line bg-paper2 p-4">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                  <Scale size={12} className="text-red" /> Cómo leer el impacto
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                  “Positivo” y “negativo” son juicios argumentados, no etiquetas partidistas. Cada uno se puede
                  discutir con la fuente en la mano. “Mixto” significa que el balance sigue en debate.
                </p>
              </div>
              <div className="border border-line bg-yellow/30 p-4">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/70">
                  <Clock size={12} className="text-red" /> Rigor {era.rigor}
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink/70">
                  A mayor cercanía al presente, más fuentes y más detalle. Los hechos pendientes se marcan como
                  tales; no se presentan como verificados.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function EventoCard({ ev, abierto, onToggle }: { ev: EventoHistoria; abierto: boolean; onToggle: () => void }) {
  const imp = IMPACTO[ev.impacto] || IMPACTO.mixto;
  return (
    <article id={`ev-${ev.slug}`} className="relative pl-11">
      <span className={`absolute left-[13px] top-6 h-2.5 w-2.5 border-2 bg-paper ${abierto ? "border-red" : "border-line2"}`} />
      <div className={`border bg-paper2 transition-colors ${abierto ? "border-ink/30" : "border-line hover:border-line2"}`}>
        <button onClick={onToggle} className="w-full px-4 py-4 text-left" aria-expanded={abierto}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-blue2/25 bg-blue px-2 py-0.5 font-mono text-[10px] font-semibold text-blue2">{ev.fecha_str}</span>
            <Badge tone={imp.tone}>{imp.label}</Badge>
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{ev.categoria}</span>
            {ev.verificacion === "pendiente-manual" && <Badge tone="yellow">Pendiente de verificación</Badge>}
            <ChevronDown size={14} className={`ml-auto text-muted transition-transform ${abierto ? "rotate-180" : ""}`} />
          </div>
          <h2 className="mt-2.5 font-display text-[1.08rem] font-bold leading-snug text-ink">{ev.titulo}</h2>
          {(ev.administracion || ev.responsables) && (
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
              {ev.administracion && <span>Administración: <span className="text-ink/70">{ev.administracion}</span></span>}
              {ev.responsables && <span>Responsables: <span className="text-ink/70">{ev.responsables}</span></span>}
            </div>
          )}
          {!abierto && <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{ev.descripcion_simple}</p>}
        </button>
        {abierto && (
          <div className="border-t border-line px-4 py-4">
            <DualView simple={ev.descripcion_simple} tecnico={ev.descripcion_tecnica} fuentes={ev.fuentes} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              <span>Slug: {ev.slug}</span>
              <Link to={`/buscar?q=${encodeURIComponent(ev.titulo)}`} className="flex items-center gap-1 hover:text-red">
                Buscar este hecho <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
