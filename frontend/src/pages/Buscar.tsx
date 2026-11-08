import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Activity, ArrowRight, Command, Database, FileText, History, Lightbulb, MapPinned,
  Search, Sparkles, TriangleAlert,
} from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Skeleton, EmptyState } from "../components/ui";
import { useApi } from "../lib/useApi";
import type { Busqueda, BusquedaItem } from "../lib/types";

const SUGERENCIAS = ["pobreza", "desempleo", "Antioquia", "TRM", "salud", "Constitución", "inflación", "contratación"];

const ICONOS: Record<string, typeof Activity> = {
  indicador: Activity,
  historia: History,
  problematica: TriangleAlert,
  solucion: Lightbulb,
  departamento: MapPinned,
  pagina: FileText,
};

const FILTROS = [
  { id: "todos", label: "Todo" },
  { id: "indicador", label: "Indicadores" },
  { id: "historia", label: "Historia" },
  { id: "problematica", label: "Problemáticas" },
  { id: "solucion", label: "Soluciones" },
  { id: "departamento", label: "Territorio" },
];

export default function Buscar() {
  const [params, setParams] = useSearchParams();
  const [texto, setTexto] = useState(params.get("q") || "");
  const [consulta, setConsulta] = useState(params.get("q") || "");
  const [filtro, setFiltro] = useState("todos");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setConsulta(texto.trim()), 220);
    return () => window.clearTimeout(id);
  }, [texto]);

  useEffect(() => {
    const q = params.get("q") || "";
    if (q && q !== texto) {
      setTexto(q);
      setConsulta(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const { data, cargando } = useApi<Busqueda>(consulta.length >= 2 ? `/buscar?q=${encodeURIComponent(consulta)}&limite=8` : null);

  const grupos = useMemo(() => {
    const gs = data?.grupos || [];
    return filtro === "todos" ? gs : gs.filter((g) => g.tipo === filtro);
  }, [data, filtro]);

  const total = grupos.reduce((a, g) => a + g.items.length, 0);

  function buscar(q: string) {
    setTexto(q);
    setConsulta(q);
    setParams({ q }, { replace: true });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setConsulta(texto.trim());
    if (texto.trim()) setParams({ q: texto.trim() }, { replace: true });
  }

  return (
    <main>
      <PageHeader
        kicker="Buscador global · 11"
        title={<>Una consulta. <span className="text-red">Todo el registro.</span></>}
        description="Indicadores, historia, problemáticas, soluciones, departamentos y páginas del sistema. La búsqueda corre sobre los datos verificados, no sobre un índice de opiniones."
        meta={
          <>
            <Badge tone="blue"><Search size={11} /> Búsqueda transversal</Badge>
            <Badge tone="line">Atajo: ⌘K / Ctrl+K</Badge>
            <Badge tone="yellow">Sin resultados patrocinados</Badge>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <form onSubmit={enviar} className="border border-ink bg-paper2 p-2 shadow-[5px_5px_0_0_rgba(20,21,24,0.08)]">
          <div className="flex items-center gap-3 px-2">
            <Search size={20} className="shrink-0 text-red" />
            <input
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Busca un indicador, un hecho, una problemática, un departamento…"
              className="w-full bg-transparent py-3 text-[15px] text-ink outline-none placeholder:text-muted/60"
              aria-label="Buscar en SARCOL"
            />
            <span className="hidden shrink-0 border border-line px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted sm:block">Enter</span>
            <Button type="submit" variant="primary" className="shrink-0">Buscar</Button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">Prueba:</span>
          {SUGERENCIAS.map((s) => (
            <button key={s} onClick={() => buscar(s)} className="border border-line bg-paper2 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted transition-colors hover:border-red/40 hover:text-red">
              {s}
            </button>
          ))}
        </div>

        {consulta.length >= 2 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <div className="flex flex-wrap gap-1.5">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors ${
                    filtro === f.id ? "border-ink bg-ink text-paper" : "border-line bg-paper2 text-muted hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              {cargando ? "Buscando…" : `${total} resultados para “${consulta}”`}
            </span>
          </div>
        )}

        {consulta.length < 2 && (
          <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="border border-line bg-paper2 p-5">
              <Kicker className="text-red">Empieza por una pregunta</Kicker>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-ink">¿Qué quieres verificar?</h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                El buscador no adivina. Devuelve coincidencias con su tipo, su contexto y un enlace directo al
                instrumento donde vive el dato.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  { t: "Indicadores", d: "Series, fuentes y comparativas", to: "/estado-actual", icono: Database },
                  { t: "Historia", d: "Hechos, responsables y eras", to: "/historia", icono: History },
                  { t: "Problemáticas", d: "Pirámide y votos", to: "/problematicas", icono: TriangleAlert },
                  { t: "Territorio", d: "Contratación por departamento", to: "/mapa", icono: MapPinned },
                ].map((c) => (
                  <Link key={c.t} to={c.to} className="group border border-line bg-paper p-3 transition-colors hover:border-red/40">
                    <c.icono size={15} className="text-red" />
                    <div className="mt-2 text-[12px] font-semibold text-ink group-hover:text-red">{c.t}</div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{c.d}</div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="border border-line bg-yellow/30 p-5">
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/70"><Sparkles size={13} className="text-red" /> Cómo buscar mejor</div>
              <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-ink/70">
                <li>· Usa una sola palabra clave: “pobreza”, “Gini”, “Antioquia”.</li>
                <li>· Busca por nombre de indicador o por categoría.</li>
                <li>· Si buscas un hecho histórico, prueba con el año o el presidente.</li>
                <li>· Desde cualquier página puedes abrir el buscador con ⌘K.</li>
              </ul>
              <div className="mt-4 flex items-center gap-2 border border-ink/10 bg-paper2 px-2.5 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                <Command size={12} /> ⌘K / Ctrl+K
              </div>
            </div>
          </div>
        )}

        {consulta.length >= 2 && cargando && (
          <div className="mt-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        )}

        {consulta.length >= 2 && !cargando && grupos.length > 0 && (
          <div className="mt-5 space-y-7">
            {grupos.map((g) => (
              <section key={g.tipo}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-ink">{g.etiqueta}</h2>
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{g.items.length}</span>
                </div>
                <div className="border border-line bg-paper2">
                  {g.items.map((item: BusquedaItem) => {
                    const Icono = ICONOS[item.tipo] || FileText;
                    return (
                      <Link key={`${g.tipo}-${item.id}`} to={item.ruta} className="group flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0 hover:bg-yellow/20">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-line bg-paper text-red"><Icono size={14} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ink group-hover:text-red">{item.titulo}</span>
                          <span className="block truncate font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{item.subtitulo}</span>
                        </span>
                        <Badge tone="line">{item.badge}</Badge>
                        <ArrowRight size={13} className="shrink-0 text-muted group-hover:text-red" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {consulta.length >= 2 && !cargando && grupos.length === 0 && (
          <div className="mt-6">
            <EmptyState
              title="Sin coincidencias"
              description={`No encontramos resultados para “${consulta}”. Prueba con una palabra más general o revisa la ortografía.`}
              action={<Button variant="soft" onClick={() => { setTexto(""); setConsulta(""); setParams({}, { replace: true }); }}>Limpiar búsqueda</Button>}
            />
          </div>
        )}

        {consulta.length >= 2 && !cargando && grupos.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border border-line bg-paper2 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
            <span>{total} resultados · {grupos.length} grupos</span>
            <Link to="/panel" className="flex items-center gap-1 text-red hover:underline">Volver al panel <ArrowRight size={10} /></Link>
          </div>
        )}
      </section>
    </main>
  );
}
