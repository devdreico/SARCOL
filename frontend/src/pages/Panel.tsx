import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, ArrowUpRight, Clock, Database, Download, MapPinned,
  RefreshCw, ShieldCheck, TriangleAlert, Vote,
} from "lucide-react";
import DataTicker from "../components/DataTicker";
import { useLive } from "../components/LiveProvider";
import {
  Badge, Button, Kicker, PageHeader, Reveal, SectionHeader, Skeleton, StatCard, StatusDot, TierBadge,
} from "../components/ui";
import { useApi } from "../lib/useApi";
import { apiPost } from "../lib/api";
import type { PanelData } from "../lib/types";
import { duracion, fechaHora, formatear, haceCuanto } from "../lib/format";

export default function Panel() {
  const { pulso, conectado } = useLive();
  const { data, cargando, refetch } = useApi<PanelData>("/panel");
  const [refrescando, setRefrescando] = useState(false);
  const [aviso, setAviso] = useState("");

  async function refrescar() {
    setRefrescando(true);
    setAviso("");
    try {
      const r = await apiPost<{ mensaje: string }>("/meta/refrescar", {});
      setAviso(r.mensaje);
      window.setTimeout(() => {
        setRefrescando(false);
        refetch();
      }, 5000);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo iniciar la verificación.");
      setRefrescando(false);
    }
  }

  const kpis = data?.kpis || [];
  const top = data?.mapa.top || [];
  const maxProcesos = Math.max(1, ...top.map((d) => d.procesos));
  const conteos = data?.conteos || pulso?.conteos;
  const actividad = data?.actividad || pulso?.actividad || [];
  const fuentes = data?.fuentes || pulso?.fuentes || [];

  return (
    <main>
      <PageHeader
        kicker="Sala de situación · 01"
        title={<>El pulso del país, <span className="text-red">sin edición.</span></>}
        description="Una sola pantalla para ver qué está pasando, de dónde sale cada dato y qué está decidiendo el país. Actualización automática, bitácora visible y ninguna cifra sin fuente."
        actions={
          <>
            <Button variant="primary" onClick={refrescar} disabled={refrescando}>
              <RefreshCw size={14} className={refrescando ? "animate-spin" : ""} />
              {refrescando ? "Verificando…" : "Verificar ahora"}
            </Button>
            <Button to="/datos-abiertos" variant="soft">
              <Download size={14} /> Descargar
            </Button>
          </>
        }
        meta={
          <>
            <Badge tone={pulso?.estado === "ok" ? "green" : "red"}>
              <StatusDot estado={pulso?.estado === "ok" ? "ok" : "error"} />
              {pulso?.estado === "ok" ? "Sistema en vivo" : "Sistema con alerta"}
            </Badge>
            <Badge tone="line"><Clock size={11} /> Última verificación: {haceCuanto(data?.actualizado_en || pulso?.actualizado_en || null)}</Badge>
            <Badge tone="blue"><ShieldCheck size={11} /> {conteos?.indicadores ?? 63} indicadores · {conteos?.historia ?? 0} hechos</Badge>
            {aviso && <Badge tone="yellow">{aviso}</Badge>}
          </>
        }
      />

      <div id="pulso" className="scroll-mt-24">
        <DataTicker />
      </div>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-5 flex items-center justify-between">
          <Kicker>Indicadores clave · fecha del dato vs. fecha de verificación</Kicker>
          <Link to="/estado-actual" className="hidden items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted hover:text-red sm:flex">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cargando && !kpis.length && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
          {kpis.map((k, i) => (
            <Reveal key={k.key} delay={i * 0.04}>
              <StatCard
                label={k.nombre}
                value={k.valor}
                formato={k.formato}
                unit={k.unidad}
                date={k.fecha_valor}
                source={k.fuente_nombre}
                serie={k.serie}
                color={["#e4002b", "#2f5f9e", "#b08a1e", "#1f7a5c", "#e4002b", "#2f5f9e"][i % 6]}
                href={`/estado-actual?indicador=${k.key}`}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper2/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SectionHeader
              kicker="Territorio · contratación pública"
              title={<>Dónde se concentra <span className="text-blue2">el gasto.</span></>}
              description="Procesos publicados en SECOP II durante los últimos 365 días. El valor es referencial (precio base), no gasto ejecutado."
              action={<Button to="/mapa" variant="soft">Abrir mapa <MapPinned size={13} /></Button>}
            />
            <div className="mt-6 border border-line bg-paper2">
              {top.map((d, i) => (
                <Link
                  key={d.departamento}
                  to={`/mapa?dpto=${encodeURIComponent(d.departamento)}`}
                  className="group flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0 hover:bg-yellow/20"
                >
                  <span className="w-5 shrink-0 font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[12.5px] font-semibold text-ink group-hover:text-red">{d.departamento}</span>
                      <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink">{d.procesos.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-paper3">
                      <div className="h-full rounded-full bg-blue2/60 transition-all group-hover:bg-red" style={{ width: `${Math.max(2, (d.procesos / maxProcesos) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="hidden w-24 shrink-0 text-right font-mono text-[9.5px] text-muted sm:block">
                    ${(d.valor_referencial / 1e12).toLocaleString("es-CO", { maximumFractionDigits: 1 })} B
                  </div>
                </Link>
              ))}
              {!top.length && <Skeleton className="h-72" />}
            </div>
          </div>

          <div>
            <SectionHeader
              kicker="Cobertura del catálogo"
              title={<>Qué sabemos <span className="text-red">y qué falta.</span></>}
              description="Categorías activas del árbol de indicadores. La barra muestra cuántos datos tienen valor verificado."
            />
            <div className="mt-6 space-y-3">
              {(data?.categorias || []).map((c) => {
                const pct = c.total ? Math.round((c.con_dato / c.total) * 100) : 0;
                return (
                  <div key={c.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px] font-medium text-ink">{c.nombre}</span>
                      <span className="font-mono text-[9.5px] tabular-nums text-muted">{c.con_dato}/{c.total}</span>
                    </div>
                    <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-paper3">
                      <div className={`h-full rounded-full ${pct > 0 ? "bg-red" : "bg-line2"}`} style={{ width: `${Math.max(2, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
              {!data && <Skeleton className="h-72" />}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeader
            kicker="Bitácora · últimas ejecuciones"
            title={<>Lo que el sistema <span className="text-blue2">acaba de verificar.</span></>}
            action={<Button to="/fuentes" variant="soft">Abrir bitácora <ArrowUpRight size={13} /></Button>}
          />
          <div className="mt-5 border border-line bg-paper2">
            {actividad.slice(0, 8).map((a, i) => (
              <div key={`${a.fuente}-${i}`} className="flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0">
                <StatusDot estado={a.estado} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-ink">{a.fuente}</div>
                  <div className="truncate font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{a.detalle}</div>
                </div>
                <div className="shrink-0 text-right font-mono text-[9px] text-muted">
                  <div>{haceCuanto(a.ultima_ejecucion)}</div>
                  <div className="text-muted/70">{duracion(a.duracion_ms)}</div>
                </div>
              </div>
            ))}
            {!actividad.length && <Skeleton className="h-64" />}
          </div>
        </div>

        <div>
          <SectionHeader
            kicker="Decisiones activas"
            title={<>Donde el país <span className="text-red">está decidiendo.</span></>}
            action={<Button to="/problematicas" variant="soft">Participar <Vote size={13} /></Button>}
          />
          <div className="mt-5 space-y-3">
            {(data?.decisiones || []).map((d) => (
              <Link key={d.slug} to={`/problematicas?slug=${d.slug}`} className="group block border border-line bg-paper2 p-4 transition-all hover:-translate-y-0.5 hover:border-red/40">
                <div className="flex items-center gap-2">
                  <Badge tone="red"><TriangleAlert size={10} /> Decisión activa</Badge>
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{d.fecha_decision || "vigente"}</span>
                </div>
                <h3 className="mt-2 font-display text-[1.02rem] font-bold leading-snug text-ink group-hover:text-red">{d.titulo}</h3>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{d.nivel} · {d.ambito}</div>
              </Link>
            ))}
            {data && data.decisiones.length === 0 && (
              <div className="border border-dashed border-line2 bg-paper2/60 p-8 text-center text-[12px] text-muted">
                No hay decisiones activas. La pirámide sigue abierta.
              </div>
            )}
            {!data && <Skeleton className="h-64" />}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper2/50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <SectionHeader
            kicker="Salud de las fuentes"
            title={<>De dónde sale <span className="text-blue2">cada número.</span></>}
            description="Cada fuente tiene un orden de prioridad. Si una falla, la interfaz lo dice; no se rellena con datos inventados."
            action={<Button to="/fuentes" variant="outline">Directorio de fuentes <ArrowRight size={13} /></Button>}
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fuentes.filter((f) => f.tipo === "en vivo").map((f) => (
              <div key={f.key} className="border border-line bg-paper2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <TierBadge tier={f.tier} />
                  <StatusDot estado={f.estado} />
                </div>
                <h3 className="mt-3 line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink">{f.nombre}</h3>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{f.frecuencia}</div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-2 font-mono text-[9px] text-muted">
                  <span>{f.registros ? `${f.registros.toLocaleString("es-CO")} reg.` : f.estado}</span>
                  <span>{f.ultima_ejecucion ? haceCuanto(f.ultima_ejecucion) : "sin ejecución"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: conteos?.indicadores ?? 63, t: "Indicadores", d: "series verificadas", icono: Database, to: "/estado-actual" },
            { n: conteos?.historia ?? 0, t: "Hechos históricos", d: "con responsables y fuentes", icono: Clock, to: "/historia" },
            { n: conteos?.problematicas ?? 0, t: "Problemáticas", d: "en la pirámide pública", icono: TriangleAlert, to: "/problematicas" },
            { n: conteos?.votos ?? 0, t: "Votos", d: "anónimos, 1 por dispositivo", icono: Vote, to: "/problematicas" },
          ].map((c) => (
            <Link key={c.t} to={c.to} className="group border border-line bg-paper2 p-5 transition-all hover:-translate-y-0.5 hover:border-red/40">
              <c.icono size={18} className="text-red" />
              <div className="mt-4 font-display text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-ink">{c.n.toLocaleString("es-CO")}</div>
              <div className="mt-1 text-[12px] font-semibold text-ink">{c.t}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{c.d}</div>
              <div className="mt-3 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted group-hover:text-red">Abrir <ArrowUpRight size={10} /></div>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-line bg-paper2 px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted">
          <span className="flex items-center gap-2"><Activity size={12} className="text-red" /> {conectado ? "SSE conectado" : "Polling cada 45 s"} · {fechaHora(data?.actualizado_en || "") || "sin fecha"}</span>
          <span>Los datos se actualizan sin recargar la página</span>
        </div>
      </section>
    </main>
  );
}
