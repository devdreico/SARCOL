import {
  ArrowRight, Braces, CheckCircle2, Code2, Database, Download, ExternalLink,
  FileJson, FileText, Globe2, Radio, Server, Terminal,
} from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Reveal, SectionHeader, Sello } from "../components/ui";
import { useApi } from "../lib/useApi";

const DESCARGAS = [
  { id: "indicadores", nombre: "Indicadores", ruta: "/api/export/indicadores.csv", desc: "63 series con valor, fecha del dato, fuente y TIER.", icono: Database, tone: "blue" as const },
  { id: "historia", nombre: "Historia", ruta: "/api/export/historia.csv", desc: "Hechos históricos con era, administración, responsables e impacto.", icono: FileText, tone: "yellow" as const },
  { id: "problematicas", nombre: "Problemáticas y soluciones", ruta: "/api/export/problematicas.csv", desc: "Pirámide completa con análisis, propuesta y fuentes.", icono: FileJson, tone: "red" as const },
  { id: "mapa", nombre: "Contratación por departamento", ruta: "/api/export/mapa.csv", desc: "Procesos y valor referencial de SECOP II por departamento.", icono: Globe2, tone: "blue" as const },
];

const ENDPOINTS = [
  { metodo: "GET", ruta: "/api/panel", desc: "Resumen agregado: KPIs, categorías, fuentes, actividad, decisiones y mapa." },
  { metodo: "GET", ruta: "/api/estado/arbol", desc: "Árbol completo de indicadores por categoría, con series y comparativas." },
  { metodo: "GET", ruta: "/api/historia", desc: "Tres eras históricas con eventos, responsables, impacto y fuentes." },
  { metodo: "GET", ruta: "/api/problematicas", desc: "Pirámide nacional, departamental y municipal con conteo de votos." },
  { metodo: "GET", ruta: "/api/soluciones", desc: "Soluciones con análisis, propuesta, fuentes y votos de acuerdo." },
  { metodo: "GET", ruta: "/api/mapa/datos", desc: "Contratación pública agregada por los 33 departamentos." },
  { metodo: "GET", ruta: "/api/meta/pulso", desc: "Ticker en vivo, salud de fuentes, conteos y próxima verificación." },
  { metodo: "GET", ruta: "/api/meta/fuentes", desc: "Directorio de fuentes con estado, frecuencia, cobertura y última ejecución." },
  { metodo: "GET", ruta: "/api/meta/actividad?limite=40", desc: "Bitácora cruda de verificaciones: estado, duración y registros." },
  { metodo: "GET", ruta: "/api/buscar?q=pobreza", desc: "Búsqueda transversal en indicadores, historia, problemáticas y territorios." },
  { metodo: "GET", ruta: "/api/export/indicadores.csv", desc: "Descarga CSV de indicadores (UTF-8 con BOM, separador ;)." },
  { metodo: "GET", ruta: "/api/health", desc: "Salud del sistema: versión, indicadores, última verificación y hora del servidor." },
  { metodo: "GET", ruta: "/api/meta/eventos", desc: "Stream SSE con eventos de verificación en tiempo real (polling fallback)." },
];

export default function DatosAbiertos() {
  const { data: health } = useApi<{ estado: string; version: string; indicadores: number; indicadores_con_dato: number; ultima_verificacion: string | null }>("/health");

  return (
    <main>
      <PageHeader
        kicker="Datos abiertos · 10"
        title={<>El registro es público. <span className="text-blue2">También la API.</span></>}
        description="SARCOL no encierra sus datos. Cualquiera puede descargarlos, citarlos, auditarlos o construir sobre ellos. Sin clave, sin registro y sin permiso previo."
        actions={
          <>
            <Button href="/docs" variant="primary"><Terminal size={14} /> Abrir OpenAPI</Button>
            <Button href="/api/export/indicadores.csv" variant="soft"><Download size={14} /> CSV de indicadores</Button>
          </>
        }
        meta={
          <>
            <Badge tone={health?.estado === "ok" ? "green" : "red"}><Server size={11} /> API {health?.estado === "ok" ? "operativa" : "verificando"} · v{health?.version || "2.0"}</Badge>
            <Badge tone="blue"><Database size={11} /> {health?.indicadores_con_dato ?? "—"}/{health?.indicadores ?? 63} series con dato</Badge>
            <Badge tone="yellow">Sin clave · sin registro</Badge>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-line bg-paper2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Kicker className="text-red">Principio de apertura</Kicker>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-ink">Datos que se pueden sacar del sistema.</h2>
              </div>
              <Sello>Open by default</Sello>
            </div>
            <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-muted">
              La transparencia no es una sección de la web: es una propiedad del sistema. Cada endpoint que usa
              la interfaz está disponible para cualquiera. Los datos originales conservan la licencia de su
              fuente; la agregación, la metodología y la doble explicación son de SARCOL.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="line">CSV · UTF-8</Badge>
              <Badge tone="line">JSON · REST</Badge>
              <Badge tone="line">SSE · tiempo real</Badge>
              <Badge tone="line">CORS abierto</Badge>
            </div>
          </div>
          <div className="border border-line bg-ink p-5 text-paper">
            <Kicker className="text-yellow">Estado en vivo</Kicker>
            <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-green2">
              <CheckCircle2 size={13} /> {health?.estado === "ok" ? "Sistema operativo" : "Consultando…"}
            </div>
            <div className="mt-4 space-y-2 font-mono text-[9.5px] uppercase tracking-[0.06em] text-paper/55">
              <div className="flex justify-between border-b border-paper/10 pb-1.5"><span>Versión</span><span className="text-paper/85">{health?.version || "2.0.0"}</span></div>
              <div className="flex justify-between border-b border-paper/10 pb-1.5"><span>Indicadores</span><span className="text-paper/85">{health?.indicadores ?? "—"}</span></div>
              <div className="flex justify-between border-b border-paper/10 pb-1.5"><span>Con dato</span><span className="text-paper/85">{health?.indicadores_con_dato ?? "—"}</span></div>
              <div className="flex justify-between"><span>Última verificación</span><span className="text-paper/85">{health?.ultima_verificacion ? new Date(health.ultima_verificacion).toLocaleDateString("es-CO") : "—"}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="descargas" className="scroll-mt-24 border-y border-line bg-paper2/50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <SectionHeader
            kicker="01 / Descargas"
            title={<>Cuatro datasets, <span className="text-red">sin fricción.</span></>}
            description="Archivos CSV listos para Excel, R, Python o cualquier hoja de cálculo. Separador punto y coma y BOM para acentos."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {DESCARGAS.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.05}>
                <a href={d.ruta} className="group flex items-start gap-4 border border-line bg-paper2 p-4 transition-all hover:-translate-y-0.5 hover:border-red/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-paper text-red"><d.icono size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-[14px] font-bold text-ink group-hover:text-red">{d.nombre}</span>
                      <Download size={14} className="text-muted group-hover:text-red" />
                    </span>
                    <span className="mt-1 block text-[11.5px] leading-relaxed text-muted">{d.desc}</span>
                    <span className="mt-2 block font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">{d.ruta}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="api" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12">
        <SectionHeader
          kicker="02 / API pública"
          title={<>REST, JSON y <span className="text-blue2">sin autenticación.</span></>}
          description="La misma API que alimenta esta interfaz. Puedes usarla desde un navegador, una notebook o un servicio de monitoreo. Sé razonable con el volumen."
          action={<Button href="/docs" variant="soft"><ExternalLink size={13} /> Ver esquema completo</Button>}
        />
        <div className="mt-6 overflow-hidden border border-line bg-paper2">
          <div className="grid grid-cols-[70px_1fr] gap-2 border-b border-line bg-paper px-4 py-2 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted sm:grid-cols-[70px_260px_1fr]">
            <span>Método</span>
            <span className="hidden sm:block">Ruta</span>
            <span>Descripción</span>
          </div>
          {ENDPOINTS.map((e) => (
            <div key={e.ruta} className="grid grid-cols-[70px_1fr] items-start gap-2 border-b border-line/70 px-4 py-2.5 last:border-0 sm:grid-cols-[70px_260px_1fr]">
              <span className={`w-fit border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold ${e.metodo === "GET" ? "border-blue2/25 bg-blue text-blue2" : "border-yellow2/60 bg-yellow text-ink"}`}>{e.metodo}</span>
              <code className="break-all font-mono text-[10px] text-ink sm:break-normal">{e.ruta}</code>
              <span className="col-span-2 text-[11.5px] leading-relaxed text-muted sm:col-span-1">{e.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper2/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 lg:grid-cols-2">
          <div className="min-w-0">
            <Kicker className="text-red">03 / Ejemplos</Kicker>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-ink">Copia, pega, audita.</h2>
            <div className="mt-4 space-y-3">
              <div className="border border-line bg-paper2">
                <div className="flex items-center justify-between border-b border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted"><span>curl · pulso</span><Terminal size={12} /></div>
                <pre className="overflow-x-auto p-3 font-mono text-[10.5px] leading-relaxed text-ink/80">{`curl -s http://localhost:8100/api/meta/pulso`}</pre>
              </div>
              <div className="border border-line bg-paper2">
                <div className="flex items-center justify-between border-b border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted"><span>JavaScript · búsqueda</span><Code2 size={12} /></div>
                <pre className="overflow-x-auto p-3 font-mono text-[10.5px] leading-relaxed text-ink/80">{`const r = await fetch("/api/buscar?q=pobreza");\nconst { grupos } = await r.json();`}</pre>
              </div>
              <div className="border border-line bg-paper2">
                <div className="flex items-center justify-between border-b border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted"><span>SSE · eventos en vivo</span><Radio size={12} /></div>
                <pre className="overflow-x-auto p-3 font-mono text-[10.5px] leading-relaxed text-ink/80">{`const es = new EventSource("/api/meta/eventos");\nes.addEventListener("fuente", (e) => console.log(e.data));`}</pre>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <Kicker className="text-blue2">04 / Estructura de un indicador</Kicker>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-ink">Qué devuelve el árbol.</h2>
            <div className="mt-4 border border-ink bg-ink p-4 text-paper">
              <pre className="overflow-x-auto font-mono text-[10px] leading-relaxed text-paper/75">{`{
  "key": "pobreza_nacional",
  "nombre": "Pobreza monetaria",
  "categoria": "Economía",
  "valor": 31.8,
  "fecha_valor": "2024",
  "formato": "pct",
  "fuente_nombre": "Banco Mundial (base: DANE)",
  "fuente_tier": 3,
  "descripcion_simple": "…",
  "descripcion_tecnica": "…",
  "serie": [{ "x": 2014, "y": 28.5 }],
  "comparativas": [{ "pais": "Colombia", "iso": "COL" }],
  "actualizado_en": "2026-10-27T…"
}`}</pre>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/api/estado/arbol" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 border border-line bg-paper2 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted hover:text-red">Ver JSON en vivo <ExternalLink size={10} /></a>
              <a href="/api/export/indicadores.csv" className="inline-flex items-center gap-1 border border-line bg-paper2 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted hover:text-red">Descargar CSV <Download size={10} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-line bg-paper2 p-5">
            <Kicker className="text-red">05 / Citación</Kicker>
            <h2 className="mt-2 font-display text-xl font-bold text-ink">Cómo citar a SARCOL.</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">Usa la fecha de consulta y el nombre del dataset. No cites la fecha del dato como si fuera la de la consulta.</p>
            <div className="mt-3 border-l-2 border-red bg-yellow/20 px-3 py-2 font-mono text-[10px] leading-relaxed text-ink/75">
              SARCOL. (2026). <em>Indicadores de Colombia</em> [Base de datos]. Sociedad Autónoma Regulatoria de
              Cumplimiento en Operaciones Legales. Consultado el [fecha] en [URL del despliegue].
            </div>
          </div>
          <div className="border border-line bg-paper2 p-5">
            <Kicker className="text-blue2">06 / Licencia y límites</Kicker>
            <h2 className="mt-2 font-display text-xl font-bold text-ink">Abierto, pero con fuente.</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              Puedes reutilizar la agregación y la metodología citando a SARCOL. Los datos primarios conservan
              la licencia de su fuente original. No uses el nombre SARCOL para respaldar una afirmación que el
              dato no sostiene.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="green">Reutilización permitida</Badge>
              <Badge tone="line">Atribución requerida</Badge>
              <Badge tone="red">Sin datos inventados</Badge>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-line bg-paper2 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          <span className="flex items-center gap-2"><Braces size={12} className="text-red" /> API v2.0 · OpenAPI 3.1 · CORS abierto</span>
          <a href="/docs" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-red hover:underline">Explorar OpenAPI <ArrowRight size={11} /></a>
        </div>
      </section>
    </main>
  );
}
