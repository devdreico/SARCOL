import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, ArrowUpRight, Database, FileText, History, Lightbulb,
  MapPinned, Radio, ShieldCheck, TriangleAlert, Vote, Clock,
} from "lucide-react";
import { MeshBackground } from "../components/Background";
import DataTicker from "../components/DataTicker";
import { useLive } from "../components/LiveProvider";
import {
  Badge, Button, Kicker, Reveal, SectionHeader, Sello, StatCard, StatusDot,
} from "../components/ui";
import { useApi } from "../lib/useApi";
import type { PanelData } from "../lib/types";
import { formatear, haceCuanto } from "../lib/format";

const INSTRUMENTOS = [
  { to: "/panel", icono: Activity, titulo: "Sala de situación", desc: "El pulso del país en una sola pantalla: KPIs, fuentes y decisiones activas.", badge: "En vivo", tone: "red" as const },
  { to: "/estado-actual", icono: Database, titulo: "Estado actual", desc: "63 indicadores con doble explicación, serie histórica y comparación internacional.", badge: "Datos", tone: "blue" as const },
  { to: "/historia", icono: History, titulo: "Historia", desc: "1810 → hoy, con rigor escalonado, responsables y fuentes al descubierto.", badge: "Memoria", tone: "yellow" as const },
  { to: "/problematicas", icono: TriangleAlert, titulo: "Problemáticas", desc: "La pirámide de los problemas del país, del nivel nacional al municipal.", badge: "Voto", tone: "red" as const },
  { to: "/soluciones", icono: Lightbulb, titulo: "Soluciones", desc: "Propuestas argumentadas que parten de datos, no de consignas.", badge: "Debate", tone: "blue" as const },
  { to: "/mapa", icono: MapPinned, titulo: "Mapa · Regiones", desc: "Contratación pública en vivo, departamento por departamento.", badge: "Territorio", tone: "yellow" as const },
];

export default function Home() {
  const { pulso } = useLive();
  const { data: panel } = useApi<PanelData>("/panel");
  const kpis = panel?.kpis || [];
  const porKey = Object.fromEntries(kpis.map((k) => [k.key, k]));
  const destacados = ["trm", "poblacion_total", "desempleo", "pib_crecimiento"].map((k) => porKey[k]).filter(Boolean);
  const ultima = pulso?.actualizado_en || panel?.actualizado_en;

  return (
    <main>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative overflow-hidden">
        <MeshBackground intenso />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:pb-24">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Sello>Registro público · 2026</Sello>
              <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                <StatusDot estado={pulso?.estado === "ok" ? "ok" : "error"} />
                {pulso?.estado === "ok" ? "Fuentes verificadas" : "Verificando fuentes"}
              </span>
            </div>

            <h1 className="mt-7 font-display text-[clamp(3rem,8.2vw,7.6rem)] font-black leading-[0.86] tracking-[-0.055em] text-ink text-balance">
              EL PAÍS,
              <br />
              <span className="text-red">EN DATOS</span>
              <br />
              QUE NO SE COMPRAN.
            </h1>

            <p className="mt-7 max-w-xl text-[14.5px] leading-relaxed text-ink/70 text-pretty">
              SARCOL es una entidad regulatoria de información pública. Reúne datos de Colombia
              desde fuentes priorizadas, los explica dos veces —simple y técnico— y deja que la
              ciudadanía vote. Sin comentarios. Sin contacto. Sin intermediarios del sesgo.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/panel" variant="primary">
                Abrir sala de situación <ArrowRight size={15} />
              </Button>
              <Button to="/herramientas" variant="outline">
                Ver instrumentos <ArrowUpRight size={15} />
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-red" /> Doble explicación</span>
              <span className="flex items-center gap-1.5"><Radio size={12} className="text-blue2" /> Fuentes en vivo</span>
              <span className="flex items-center gap-1.5"><Vote size={12} className="text-red" /> 1 dispositivo · 1 voto</span>
            </div>
          </div>

          {/* Tarjeta de pulso */}
          <div className="relative">
            <div className="absolute -right-3 -top-3 h-full w-full border border-ink/15" aria-hidden />
            <div className="relative border border-ink bg-paper2 p-5 shadow-[8px_8px_0_0_rgba(20,21,24,0.12)]">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <Kicker className="text-red">Pulso de hoy</Kicker>
                  <div className="mt-1 font-display text-lg font-bold text-ink">Colombia, ahora</div>
                </div>
                <span className="flex items-center gap-1.5 border border-green/30 bg-green2 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-green">
                  <span className="h-1.5 w-1.5 rounded-full bg-green pulso" /> En vivo
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {(pulso?.items || []).slice(0, 4).map((i) => (
                  <Link key={i.key} to={`/estado-actual?indicador=${i.key}`} className="group flex items-end justify-between gap-3 border-b border-line/70 pb-2.5 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{i.nombre}</div>
                      <div className="mt-1 font-display text-[1.35rem] font-extrabold leading-none tracking-[-0.03em] text-ink group-hover:text-red">
                        {formatear(i.valor, i.formato)}
                      </div>
                    </div>
                    <span className="shrink-0 pb-0.5 font-mono text-[8.5px] uppercase text-muted">{i.fecha_valor}</span>
                  </Link>
                ))}
                {!pulso && <div className="skeleton h-40" />}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">
                <span>{pulso?.conteos?.votos ?? 0} votos · {pulso?.conteos?.indicadores ?? 63} indicadores</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {ultima ? haceCuanto(ultima) : "conectando"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DataTicker />

      {/* ───────────────────────── PULSO / KPIs ───────────────────────── */}
      <section className="relative border-b border-line bg-paper2/40">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <SectionHeader
            kicker="01 / Pulso del país"
            title={<>Los números que <span className="text-red">sí</span> importan.</>}
            description="Cada tarjeta muestra el valor más reciente, la fecha del dato y su fuente. No confundimos la fecha del dato con la fecha de verificación."
            action={<Button to="/estado-actual" variant="soft">Explorar los 63 indicadores <ArrowRight size={14} /></Button>}
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((k, i) => (
              <Reveal key={k.key} delay={i * 0.06}>
                <StatCard
                  label={k.nombre}
                  value={k.valor}
                  formato={k.formato}
                  unit={k.unidad}
                  date={k.fecha_valor}
                  source={k.fuente_nombre}
                  serie={k.serie}
                  color={["#e4002b", "#2f5f9e", "#b08a1e", "#1f7a5c"][i % 4]}
                  href={`/estado-actual?indicador=${k.key}`}
                />
              </Reveal>
            ))}
            {destacados.length === 0 && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-48" />)}
          </div>
        </div>
      </section>

      {/* ───────────────────────── TRES CAPAS ───────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <SectionHeader
            kicker="02 / Cómo funciona"
            title={<>Tres capas. <span className="text-blue2">Una sola institución.</span></>}
            description="SARCOL no es un periódico ni una red social. Es un sistema: mide, explica y deja constancia."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01", t: "Pulso", d: "Qué está pasando ahora: TRM, contratación, indicadores y salud de las fuentes. Actualización automática y bitácora visible.",
                icono: Activity, clase: "bg-red text-paper2", borde: "border-red",
              },
              {
                n: "02", t: "Instrumentos", d: "Cómo se consulta y se compara: estado actual, historia, mapa, problemáticas y soluciones. Cada dato con doble explicación.",
                icono: Database, clase: "bg-blue text-blue2", borde: "border-blue2/30",
              },
              {
                n: "03", t: "Registro", d: "De dónde sale: fuentes priorizadas por TIER, metodología, bitácora, API y descargas. La confianza no se pide: se muestra.",
                icono: FileText, clase: "bg-yellow text-ink", borde: "border-yellow2/60",
              },
            ].map((c, i) => (
              <Reveal key={c.n} delay={i * 0.08}>
                <div className={`group relative h-full border ${c.borde} bg-paper2 p-6 transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_0_rgba(20,21,24,0.1)]`}>
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex h-11 w-11 items-center justify-center ${c.clase}`}><c.icono size={20} /></span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{c.n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em] text-ink">{c.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── INSTRUMENTOS ───────────────────────── */}
      <section className="border-b border-line bg-paper2/50">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <SectionHeader
            kicker="03 / Instrumentos"
            title={<>Herramientas para <span className="text-red">no creer</span>, sino verificar.</>}
            description="Un catálogo que crece: cada instrumento responde una pregunta distinta y todas terminan en la misma fuente."
            action={<Button to="/herramientas" variant="outline">Catálogo completo <ArrowRight size={14} /></Button>}
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INSTRUMENTOS.map((t, i) => (
              <Reveal key={t.to} delay={i * 0.05}>
                <Link to={t.to} className="group flex h-full flex-col border border-line bg-paper2 p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[6px_6px_0_0_rgba(20,21,24,0.09)]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center border border-line bg-paper text-red"><t.icono size={18} /></span>
                    <Badge tone={t.tone}>{t.badge}</Badge>
                  </div>
                  <h3 className="mt-5 font-display text-[1.15rem] font-bold leading-tight text-ink group-hover:text-red">{t.titulo}</h3>
                  <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted">{t.desc}</p>
                  <span className="mt-4 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted group-hover:text-red">
                    Abrir instrumento <ArrowUpRight size={11} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── ACTIVIDAD + DECISIONES ───────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader
              kicker="04 / Bitácora"
              title={<>Lo que el sistema <span className="text-blue2">acaba de verificar.</span></>}
              description="Cada ejecución queda registrada. Si una fuente falla, se ve. Si un dato se actualiza, también."
              action={<Button to="/fuentes" variant="soft">Ver bitácora completa <ArrowRight size={13} /></Button>}
            />
            <div className="mt-6 border border-line bg-paper2">
              {(pulso?.actividad || panel?.actividad || []).slice(0, 5).map((a, i) => (
                <div key={`${a.fuente}-${a.ultima_ejecucion}-${i}`} className="flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0">
                  <StatusDot estado={a.estado} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold text-ink">{a.fuente}</div>
                    <div className="truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted">{a.detalle || "sin detalle"}</div>
                  </div>
                  <div className="shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                    <div>{haceCuanto(a.ultima_ejecucion)}</div>
                    <div className="text-muted/70">{a.duracion_ms ? `${(a.duracion_ms / 1000).toFixed(1)} s` : "—"}</div>
                  </div>
                </div>
              ))}
              {!(pulso?.actividad || panel?.actividad) && <div className="skeleton h-52" />}
            </div>
          </div>

          <div>
            <SectionHeader
              kicker="05 / Decisiones activas"
              title={<>Donde el país <span className="text-red">está decidiendo.</span></>}
              description="Problemáticas abiertas a votación. Sin centro: dos opciones, siempre."
              action={<Button to="/problematicas" variant="soft">Entrar al debate <ArrowRight size={13} /></Button>}
            />
            <div className="mt-6 space-y-3">
              {(panel?.decisiones || []).slice(0, 4).map((d) => (
                <Link key={d.slug} to={`/problematicas?slug=${d.slug}`} className="group block border border-line bg-paper2 p-4 transition-all hover:-translate-y-0.5 hover:border-red/40">
                  <div className="flex items-center gap-2">
                    <Badge tone="red">● Decisión activa</Badge>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{d.fecha_decision || "vigente"}</span>
                  </div>
                  <h3 className="mt-2 font-display text-[1.05rem] font-bold leading-snug text-ink group-hover:text-red">{d.titulo}</h3>
                  <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted">{d.nivel} · {d.ambito}</div>
                </Link>
              ))}
              {panel && panel.decisiones.length === 0 && (
                <div className="border border-dashed border-line2 bg-paper2/60 p-8 text-center text-[12.5px] text-muted">
                  No hay decisiones activas en este momento. La pirámide sigue abierta.
                </div>
              )}
              {!panel && <div className="skeleton h-52" />}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── IMPARCIALIDAD ───────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <MeshBackground />
        <div className="pointer-events-none absolute inset-0 bg-ink/70" />
        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Kicker className="text-yellow">06 / Imparcialidad</Kicker>
              <h2 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-paper text-balance">
                Si el país está dividido, <span className="text-yellow">SARCOL lo muestra.</span>
              </h2>
              <p className="mt-5 max-w-lg text-[13.5px] leading-relaxed text-paper/60">
                No elegimos bando. Elegimos fuentes, mostramos metodología y dejamos que el voto
                hable. Cuando los votos quedan parejos, no inventamos un centro: mostramos la similitud.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/metodologia" variant="yellow">Leer la metodología <ArrowRight size={14} /></Button>
                <Button to="/fuentes" variant="outline" className="border-paper/25 text-paper hover:bg-paper hover:text-ink">Ver fuentes <ArrowUpRight size={14} /></Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { t: "Doble explicación", d: "Cada dato llega en lenguaje simple y con respaldo técnico completo.", icono: ShieldCheck },
                { t: "Fuentes por TIER", d: "Primero lo estatal, luego lo institucional, luego lo verificado independiente.", icono: Radio },
                { t: "Voto anónimo", d: "1 por dispositivo. Sin cuentas, sin comentarios, sin contacto.", icono: Vote },
                { t: "Bitácora visible", d: "Cada verificación deja registro: fuente, estado, duración y resultado.", icono: FileText },
              ].map((c) => (
                <div key={c.t} className="border border-paper/12 bg-paper/[0.04] p-5 transition-colors hover:border-yellow/40">
                  <c.icono size={19} className="text-yellow" />
                  <h3 className="mt-3 font-display text-[15px] font-bold text-paper">{c.t}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-paper/55">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="border-b border-line bg-yellow/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center">
          <div>
            <Kicker className="text-red">Entrar al sistema</Kicker>
            <h2 className="mt-2 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-none tracking-[-0.03em] text-ink">
              El dato es la herramienta. <span className="text-red">El voto es el mecanismo.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to="/panel" variant="ink">Abrir panel <ArrowRight size={15} /></Button>
            <Button to="/datos-abiertos" variant="soft">Descargar datos <ArrowUpRight size={15} /></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
