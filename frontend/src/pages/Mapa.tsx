import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { geoMercator, geoPath, type ExtendedFeature } from "d3-geo";
import { ArrowRight, Download, ExternalLink, Info, MapPinned, Search } from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Skeleton } from "../components/ui";
import { useApi } from "../lib/useApi";
import type { Dpto, MapaDatos } from "../lib/types";
import { normalizar, titleCase } from "../lib/format";

const NOMBRES_DPTO: Record<string, string> = {
  "SANTAFE DE BOGOTA D.C": "Bogotá D.C.",
  "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA": "San Andrés, Providencia y Santa Catalina",
  "LA GUAJIRA": "La Guajira",
  "NORTE DE SANTANDER": "Norte de Santander",
  "VALLE DEL CAUCA": "Valle del Cauca",
  "SAN ANDRES PROVIDENCIA Y SANTA CATALINA": "San Andrés, Providencia y Santa Catalina",
};

function nombreDpto(nombre: string): string {
  return NOMBRES_DPTO[nombre] || titleCase(nombre);
}

type GeoFeature = { type: "Feature"; properties: { NOMBRE_DPT: string; DPTO: string }; geometry: unknown };

const METRICAS = [
  { id: "valor", label: "Valor referencial", corto: "Valor" },
  { id: "procesos", label: "Procesos", corto: "Procesos" },
] as const;

function colorEscala(t: number): string {
  // Escala relativa: comprime la cola larga de Bogotá para que el resto del país sea legible.
  t = Math.max(0, Math.min(1, Math.pow(t, 0.2)));
  const stops: [number, [number, number, number]][] = [
    [0, [238, 244, 251]],
    [0.25, [201, 223, 245]],
    [0.55, [255, 232, 163]],
    [0.85, [228, 0, 43]],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0 || 1);
      const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * f));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
  }
  return "rgb(228,0,43)";
}

function valor(d: Dpto, metrica: "valor" | "procesos"): number {
  return metrica === "valor" ? d.valor_referencial : d.procesos;
}

function fmtValor(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toLocaleString("es-CO", { maximumFractionDigits: 1 })} billones`;
  if (v >= 1e9) return `$${(v / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil M`;
  return `$${v.toLocaleString("es-CO")}`;
}

export default function Mapa() {
  const { data, cargando } = useApi<MapaDatos>("/mapa/datos");
  const [params] = useSearchParams();
  const [geo, setGeo] = useState<{ features: GeoFeature[] } | null>(null);
  const [metrica, setMetrica] = useState<"valor" | "procesos">("valor");
  const [sel, setSel] = useState<Dpto | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch("/data/colombia.json").then((r) => r.json()).then(setGeo).catch(() => setGeo(null));
  }, []);

  const porNombre = useMemo(() => {
    const m = new Map<string, Dpto>();
    data?.departamentos.forEach((d) => m.set(normalizar(d.departamento), d));
    return m;
  }, [data]);

  useEffect(() => {
    const q = params.get("dpto");
    if (!q || !data) return;
    const encontrado = data.departamentos.find((d) => normalizar(d.departamento) === normalizar(q));
    if (encontrado) setSel(encontrado);
  }, [params, data]);

  const maxMetrica = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, ...data.departamentos.map((d) => valor(d, metrica)));
  }, [data, metrica]);

  const paths = useMemo(() => {
    if (!geo || geo.features.length === 0) return [];
    const width = 520;
    const height = 620;
    const projection = geoMercator().fitExtent([[18, 18], [width - 18, height - 18]], {
      type: "FeatureCollection",
      features: geo.features,
    } as never);
    const pathGen = geoPath(projection);
    return geo.features.map((f) => {
      const nombre = f.properties.NOMBRE_DPT;
      const d = porNombre.get(normalizar(nombre));
      const v = d ? valor(d, metrica) : 0;
      return {
        nombre,
        d: pathGen(f as unknown as ExtendedFeature) || "",
        fill: d ? colorEscala(v / maxMetrica) : "#efe7d7",
        dato: d,
      };
    });
  }, [geo, porNombre, metrica, maxMetrica]);

  const ranking = useMemo(() => {
    const q = normalizar(busqueda);
    return [...(data?.departamentos || [])]
      .sort((a, b) => valor(b, metrica) - valor(a, metrica))
      .filter((d) => !q || normalizar(d.departamento).includes(q));
  }, [data, metrica, busqueda]);

  const maxRanking = Math.max(1, ...ranking.map((d) => valor(d, metrica)));
  const totalProcesos = data?.total_procesos || 0;
  const totalValor = data?.total_valor || 0;

  return (
    <main>
      <PageHeader
        kicker="Territorio · 07"
        title={<>El mapa del <span className="text-red">gasto público.</span></>}
        description="Procesos publicados en SECOP II durante los últimos 365 días, agregados por departamento. El valor es referencial (precio base), no gasto ejecutado. Cada departamento abre su detalle."
        actions={
          <>
            <Button href="/api/export/mapa.csv" variant="soft"><Download size={14} /> CSV</Button>
            <Button to="/fuentes" variant="primary">Ver fuente <ExternalLink size={14} /></Button>
          </>
        }
        meta={
          <>
            <Badge tone="blue"><MapPinned size={11} /> {data?.departamentos.length ?? 33} departamentos</Badge>
            <Badge tone="red">{totalProcesos.toLocaleString("es-CO")} procesos con departamento</Badge>
            <Badge tone="yellow">{fmtValor(totalValor)} referenciales</Badge>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {METRICAS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetrica(m.id)}
                className={`border px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors ${
                  metrica === m.id ? "border-ink bg-ink text-paper" : "border-line bg-paper2 text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
            <span className="flex items-center gap-1"><span className="h-2.5 w-4 bg-blue" /> Menor</span>
            <span className="h-2.5 w-16" style={{ background: "linear-gradient(90deg,#eef4fb,#c9dff5,#ffe8a3,#e4002b)" }} />
            <span className="flex items-center gap-1"><span className="h-2.5 w-4 bg-red" /> Mayor</span>
            <span className="hidden text-muted/60 lg:inline">· escala relativa</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
          <div className="relative border border-line bg-paper2 p-2">
            {!geo && <Skeleton className="h-[520px]" />}
            {geo && (
              <svg ref={svgRef} viewBox="0 0 520 620" className="h-auto w-full" role="img" aria-label="Mapa de contratación pública por departamento">
                {paths.map((p) => {
                  const activo = sel?.departamento === p.nombre || hover === p.nombre;
                  return (
                    <path
                      key={p.nombre}
                      d={p.d}
                      fill={p.fill}
                      stroke={activo ? "#141518" : "#fffdf8"}
                      strokeWidth={activo ? 1.8 : 0.7}
                      className="cursor-pointer transition-[fill,stroke] duration-150"
                      onMouseEnter={() => setHover(p.nombre)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => p.dato && setSel(p.dato)}
                    >
                      <title>{nombreDpto(p.nombre)}{p.dato ? ` · ${p.dato.procesos.toLocaleString("es-CO")} procesos` : ""}</title>
                    </path>
                  );
                })}
              </svg>
            )}
            <div className="pointer-events-none absolute left-3 top-3 border border-line bg-paper2/95 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              {hover ? nombreDpto(hover) : sel ? nombreDpto(sel.departamento) : "Selecciona un departamento"}
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 border border-line bg-paper2/95 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">
              SECOP II · últimos 365 días
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-line bg-paper2 p-4">
              <div className="flex items-center justify-between">
                <Kicker>Departamento seleccionado</Kicker>
                {sel && <button onClick={() => setSel(null)} className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted hover:text-red">Limpiar</button>}
              </div>
              {sel ? (
                <>
                  <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">{nombreDpto(sel.departamento)}</h2>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="border border-line bg-paper p-3">
                      <div className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">Procesos</div>
                      <div className="mt-1 font-display text-lg font-bold text-ink">{sel.procesos.toLocaleString("es-CO")}</div>
                    </div>
                    <div className="border border-line bg-paper p-3">
                      <div className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">Valor referencial</div>
                      <div className="mt-1 font-display text-lg font-bold text-ink">{fmtValor(sel.valor_referencial)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                    <span>{((sel.procesos / Math.max(1, totalProcesos)) * 100).toFixed(1)}% del total</span>
                    <a href="https://www.datos.gov.co/resource/p6dx-8zbt" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-red hover:underline">SECOP <ExternalLink size={10} /></a>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  Haz clic en un departamento del mapa o en el ranking para ver sus procesos y su valor referencial.
                </p>
              )}
            </div>

            <div className="border border-line bg-paper2 p-4">
              <div className="flex items-center gap-2 border border-line bg-paper px-2.5 py-2">
                <Search size={13} className="text-red" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Filtrar departamento…"
                  className="w-full bg-transparent text-[11.5px] text-ink outline-none placeholder:text-muted/70"
                  aria-label="Filtrar departamento"
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                <span>Ranking · {metrica === "valor" ? "valor" : "procesos"}</span>
                <span>{ranking.length} dptos.</span>
              </div>
              <div className="mt-2 max-h-[280px] space-y-1 overflow-y-auto pr-1">
                {ranking.slice(0, 20).map((d, i) => (
                  <button
                    key={d.departamento}
                    onClick={() => setSel(d)}
                    className={`flex w-full items-center gap-2 border px-2 py-1.5 text-left transition-colors ${
                      sel?.departamento === d.departamento ? "border-red/40 bg-red/5" : "border-transparent hover:bg-yellow/20"
                    }`}
                  >
                    <span className="w-5 font-mono text-[9px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[11.5px] font-medium text-ink">{nombreDpto(d.departamento)}</span>
                        <span className="shrink-0 font-mono text-[9px] tabular-nums text-muted">
                          {metrica === "valor" ? fmtValor(d.valor_referencial) : d.procesos.toLocaleString("es-CO")}
                        </span>
                      </span>
                      <span className="mt-1 block h-[3px] overflow-hidden rounded-full bg-paper3">
                        <span className="block h-full rounded-full bg-blue2/60" style={{ width: `${Math.max(2, (valor(d, metrica) / maxRanking) * 100)}%` }} />
                      </span>
                    </span>
                  </button>
                ))}
                {!ranking.length && <div className="py-6 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-muted">Sin coincidencias</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-line bg-paper2 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          <span className="flex items-center gap-1.5"><Info size={11} className="text-red" /> {data?.nota || "Valor referencial: precio base de los procesos, no gasto ejecutado."}</span>
          <span>{cargando ? "Cargando…" : "Fuente: SECOP II · Colombia Compra Eficiente"}</span>
        </div>
      </section>

      <section id="ranking" className="border-y border-line bg-paper2/50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker className="text-red">Ranking territorial</Kicker>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.025em] text-ink">Los departamentos, en orden de contratación.</h2>
              <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted">
                Ordenado por {metrica === "valor" ? "valor referencial" : "número de procesos"}. Un departamento puede tener muchos procesos pequeños o pocos procesos grandes; ambas cosas importan.
              </p>
            </div>
            <Button href="/api/export/mapa.csv" variant="soft"><Download size={13} /> Descargar CSV</Button>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[...(data?.departamentos || [])].sort((a, b) => valor(b, metrica) - valor(a, metrica)).map((d, i) => (
              <button
                key={d.departamento}
                onClick={() => { setSel(d); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="group flex items-center gap-3 border border-line bg-paper2 px-3 py-2.5 text-left transition-colors hover:border-red/40"
              >
                <span className="w-6 shrink-0 font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[12px] font-semibold text-ink group-hover:text-red">{nombreDpto(d.departamento)}</span>
                    <span className="shrink-0 font-mono text-[9px] text-muted">{metrica === "valor" ? fmtValor(d.valor_referencial) : d.procesos.toLocaleString("es-CO")}</span>
                  </span>
                  <span className="mt-1 block h-[3px] overflow-hidden rounded-full bg-paper3">
                    <span className="block h-full rounded-full bg-red/60" style={{ width: `${Math.max(2, (valor(d, metrica) / maxRanking) * 100)}%` }} />
                  </span>
                </span>
                <ArrowRight size={11} className="shrink-0 text-muted group-hover:text-red" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
