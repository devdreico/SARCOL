import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, ChevronDown, Database, ExternalLink, Filter, Info, Search, ShieldCheck,
} from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Skeleton, TierBadge, EmptyState, StatusDot } from "../components/ui";
import DualView from "../components/DualView";
import Sparkline from "../components/Sparkline";
import CompareBars from "../components/CompareBars";
import { useApi } from "../lib/useApi";
import type { Arbol, Indicador } from "../lib/types";
import { fechaHora, formatear, haceCuanto, normalizar } from "../lib/format";

const COLORES = ["#e4002b", "#2f5f9e", "#b08a1e", "#1f7a5c", "#b00020", "#6d6a62"];

export default function EstadoActual() {
  const { data, cargando, error, refetch } = useApi<Arbol>("/estado/arbol");
  const [params] = useSearchParams();
  const indicadorInicial = params.get("indicador");
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!indicadorInicial) return;
    setAbiertos((prev) => new Set(prev).add(indicadorInicial));
    const t = window.setTimeout(() => {
      document.getElementById(`ind-${indicadorInicial}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 450);
    return () => window.clearTimeout(t);
  }, [indicadorInicial, data]);

  const categorias = data?.categorias || [];
  const total = data?.total || 0;

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return categorias
      .filter((c) => categoria === "Todas" || c.nombre === categoria)
      .map((c) => ({
        ...c,
        indicadores: c.indicadores.filter((i) => !q || normalizar(`${i.nombre} ${i.categoria} ${i.descripcion_simple} ${i.key}`).includes(q)),
      }))
      .filter((c) => c.indicadores.length > 0);
  }, [categorias, categoria, busqueda]);

  function toggle(key: string) {
    setAbiertos((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  const conDato = categorias.reduce((acc, c) => acc + c.indicadores.filter((i) => i.valor !== null).length, 0);

  return (
    <main>
      <PageHeader
        kicker="Registro de indicadores · 03"
        title={<>Colombia, <span className="text-blue2">dato por dato.</span></>}
        description="Cada serie tiene dos explicaciones, una fuente priorizada y dos fechas distintas: cuándo se produjo el dato y cuándo SARCOL lo verificó. No hay cifras sin origen."
        actions={
          <>
            <Button to="/metodologia" variant="soft"><Info size={14} /> Cómo leer</Button>
            <Button to="/datos-abiertos" variant="primary">Descargar series <ArrowRight size={14} /></Button>
          </>
        }
        meta={
          <>
            <Badge tone="blue"><Database size={11} /> {total} indicadores</Badge>
            <Badge tone="green"><StatusDot estado="ok" /> {conDato} con dato verificado</Badge>
            <Badge tone="line">Última verificación: {data?.actualizado_en ? haceCuanto(data.actualizado_en) : "—"}</Badge>
          </>
        }
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="mb-3 flex items-center gap-2 border border-line bg-paper2 px-3 py-2">
            <Search size={14} className="text-red" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar indicador…"
              className="w-full bg-transparent text-[12px] text-ink outline-none placeholder:text-muted/70"
              aria-label="Buscar indicador"
            />
          </div>
          <div className="mb-2 flex items-center justify-between">
            <Kicker>Categorías</Kicker>
            <span className="font-mono text-[9px] text-muted">{categorias.length}</span>
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            <button
              onClick={() => setCategoria("Todas")}
              className={`shrink-0 border px-2.5 py-2 text-left text-[11.5px] font-medium transition-colors ${
                categoria === "Todas" ? "border-ink bg-ink text-paper" : "border-line bg-paper2 text-ink/70 hover:border-ink/30"
              }`}
            >
              Todas <span className="ml-1 font-mono text-[9px] opacity-60">{total}</span>
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoria(c.nombre)}
                className={`flex shrink-0 items-center justify-between gap-2 border px-2.5 py-2 text-left text-[11.5px] font-medium transition-colors lg:w-full ${
                  categoria === c.nombre ? "border-red bg-red/5 text-red" : "border-line bg-paper2 text-ink/70 hover:border-ink/30"
                }`}
              >
                <span className="truncate">{c.nombre}</span>
                <span className="font-mono text-[9px] opacity-60">{c.indicadores.length}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 hidden border border-line bg-paper2 p-3 lg:block">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
              <ShieldCheck size={11} className="text-red" /> Doble explicación
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Abre cualquier indicador. Verás lenguaje simple, respaldo técnico y la fuente exacta.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
              <Filter size={12} className="text-red" />
              {filtradas.length} categorías · {filtradas.reduce((a, c) => a + c.indicadores.length, 0)} indicadores
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              Fecha del dato ≠ fecha de verificación
            </div>
          </div>

          {cargando && !data && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          )}

          {error && !data && (
            <EmptyState
              title="No se pudo cargar el árbol"
              description="La API no respondió. Puedes reintentar o revisar la bitácora de fuentes."
              action={<Button variant="primary" onClick={() => refetch()}>Reintentar</Button>}
            />
          )}

          {filtradas.map((cat) => (
            <section key={cat.id} className="mb-8">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-display text-lg font-bold tracking-[-0.01em] text-ink">{cat.nombre}</h2>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{cat.indicadores.length} series</span>
              </div>
              <div className="space-y-2">
                {cat.indicadores.map((i, idx) => (
                  <IndicadorCard
                    key={i.key}
                    indicador={i}
                    abierto={abiertos.has(i.key)}
                    onToggle={() => toggle(i.key)}
                    color={COLORES[idx % COLORES.length]}
                  />
                ))}
              </div>
            </section>
          ))}

          {!cargando && filtradas.length === 0 && (
            <EmptyState
              title="Sin resultados"
              description="No hay indicadores que coincidan con tu búsqueda. Prueba con otro término o cambia de categoría."
              action={<Button variant="soft" onClick={() => { setBusqueda(""); setCategoria("Todas"); }}>Limpiar filtros</Button>}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function IndicadorCard({
  indicador: i,
  abierto,
  onToggle,
  color,
}: {
  indicador: Indicador;
  abierto: boolean;
  onToggle: () => void;
  color: string;
}) {
  const sinDato = i.valor === null;
  return (
    <article id={`ind-${i.key}`} className={`border bg-paper2 transition-colors ${abierto ? "border-ink/30" : "border-line hover:border-line2"}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={abierto}
      >
        <span className="hidden h-8 w-1 shrink-0 sm:block" style={{ background: sinDato ? "#d9d0bf" : color }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[13px] font-semibold leading-snug text-ink">{i.nombre}</h3>
            {sinDato && <Badge tone="line">Sin dato</Badge>}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
            <span>{i.unidad}</span>
            <span className="text-line2">·</span>
            <span>dato {i.fecha_valor || "—"}</span>
            <span className="text-line2">·</span>
            <span>{i.fuente_nombre}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`font-display text-[1.2rem] font-extrabold leading-none tracking-[-0.03em] ${sinDato ? "text-muted" : "text-ink"}`}>
            {formatear(i.valor, i.formato)}
          </div>
          <div className="mt-0.5 font-mono text-[8.5px] uppercase text-muted">{sinDato ? "sin verificar" : i.fecha_valor}</div>
        </div>
        <ChevronDown size={15} className={`shrink-0 text-muted transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div className="border-t border-line px-4 py-4">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <DualView
                simple={i.descripcion_simple || "Sin descripción simple registrada."}
                tecnico={i.descripcion_tecnica || "Sin respaldo técnico registrado."}
                nota={i.nota}
                fuentes={i.fuente_url ? [{ nombre: i.fuente_nombre, url: i.fuente_url }] : null}
              />
            </div>
            <div className="space-y-4">
              {i.serie && i.serie.length >= 3 && (
                <div className="border border-line bg-paper p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <Kicker>Serie</Kicker>
                    <span className="font-mono text-[9px] text-muted">{i.serie[0].x} → {i.serie[i.serie.length - 1].x}</span>
                  </div>
                  <Sparkline serie={i.serie} color={color} width={340} height={70} />
                </div>
              )}
              {i.comparativas && i.comparativas.length >= 2 && (
                <div className="border border-line bg-paper p-3">
                  <CompareBars comparativas={i.comparativas} formato={(v) => formatear(v, i.formato)} />
                </div>
              )}
              <div className="border border-line bg-paper p-3 font-mono text-[9.5px] leading-relaxed text-muted">
                <div className="flex items-center justify-between gap-2">
                  <span className="uppercase tracking-[0.08em]">Fuente</span>
                  <TierBadge tier={i.fuente_tier} />
                </div>
                <div className="mt-1.5 text-ink/75">{i.fuente_nombre}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-2">
                  <div>
                    <div className="uppercase tracking-[0.08em] text-muted/70">Fecha del dato</div>
                    <div className="text-ink/80">{i.fecha_valor || "—"}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-[0.08em] text-muted/70">Verificado</div>
                    <div className="text-ink/80">{i.actualizado_en ? fechaHora(i.actualizado_en) : "—"}</div>
                  </div>
                </div>
                {i.fuente_url && (
                  <a href={i.fuente_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-red hover:underline">
                    Abrir fuente original <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
            <span>Clave: {i.key}</span>
            <Link to={`/buscar?q=${encodeURIComponent(i.nombre)}`} className="flex items-center gap-1 hover:text-red">
              Buscar en todo el sistema <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
