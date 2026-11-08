import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, ArrowUpRight, BookOpen, Clock, Database, Download, FileJson,
  FileText, Globe2, History, Landmark, LayoutDashboard, Lightbulb, MapPinned,
  Radio, Search, ShieldCheck, Terminal, TriangleAlert, Vote, Wallet, Map,
} from "lucide-react";
import { Badge, Button, Kicker, PageHeader, Reveal, SectionHeader } from "../components/ui";
import { normalizar } from "../lib/format";

type Instrumento = {
  to: string;
  titulo: string;
  desc: string;
  categoria: string;
  icono: typeof Activity;
  badge: string;
};

const INSTRUMENTOS: Instrumento[] = [
  { to: "/panel", titulo: "Sala de situación", desc: "KPIs, fuentes, actividad y decisiones activas en una sola pantalla.", categoria: "Sala de situación", icono: LayoutDashboard, badge: "En vivo" },
  { to: "/panel#pulso", titulo: "Pulso en vivo", desc: "La cinta de datos que se actualiza sin recargar la página.", categoria: "Sala de situación", icono: Activity, badge: "En vivo" },
  { to: "/fuentes", titulo: "Salud del sistema", desc: "Estado real de cada fuente: última ejecución, duración y registros.", categoria: "Sala de situación", icono: ShieldCheck, badge: "Bitácora" },
  { to: "/estado-actual", titulo: "Árbol de indicadores", desc: "63 series con doble explicación, fecha del dato y fuente priorizada.", categoria: "Datos", icono: Database, badge: "63 series" },
  { to: "/estado-actual?indicador=trm", titulo: "Tasa de cambio (TRM)", desc: "El termómetro diario del peso frente al dólar, con serie de 30 días.", categoria: "Datos", icono: Wallet, badge: "Diario" },
  { to: "/estado-actual?indicador=pobreza_nacional", titulo: "Pobreza monetaria", desc: "Cuántos colombianos no alcanzan la línea de pobreza y cómo cambia.", categoria: "Datos", icono: Database, badge: "Social" },
  { to: "/estado-actual?indicador=desempleo", titulo: "Mercado laboral", desc: "Desempleo, participación, informalidad y brechas de género.", categoria: "Datos", icono: Activity, badge: "Trabajo" },
  { to: "/estado-actual?indicador=gini", titulo: "Desigualdad", desc: "Gini, brecha de deciles y participación del ingreso más pobre.", categoria: "Datos", icono: Globe2, badge: "Social" },
  { to: "/estado-actual?indicador=secop_procesos", titulo: "Contratación pública", desc: "Procesos y valor referencial de SECOP II, con corte nacional.", categoria: "Datos", icono: FileText, badge: "SECOP" },
  { to: "/historia", titulo: "Historia de Colombia", desc: "1810 → hoy, con rigor escalonado, administración y responsables.", categoria: "Memoria", icono: History, badge: "80 hechos" },
  { to: "/historia?era=1810-1900", titulo: "Línea de tiempo", desc: "Hechos ordenados por era, impacto y categoría. Sin relato único.", categoria: "Memoria", icono: Clock, badge: "1810-1900" },
  { to: "/historia?era=1991-hoy", titulo: "Colombia reciente", desc: "De la Constitución de 1991 al presente, con fuentes verificadas.", categoria: "Memoria", icono: Landmark, badge: "Reciente" },
  { to: "/problematicas", titulo: "Pirámide de problemáticas", desc: "De lo nacional a lo municipal. Sin centro: dos opciones, siempre.", categoria: "Participación", icono: TriangleAlert, badge: "16 casos" },
  { to: "/problematicas?filtro=decision", titulo: "Decisiones activas", desc: "Los debates que el país está decidiendo en este momento.", categoria: "Participación", icono: Vote, badge: "Abierto" },
  { to: "/soluciones", titulo: "Soluciones", desc: "Propuestas argumentadas que parten de datos, no de consignas.", categoria: "Participación", icono: Lightbulb, badge: "Debate" },
  { to: "/problematicas#votos", titulo: "Votaciones", desc: "Resultados anónimos, 1 voto por dispositivo. Si hay empate, se muestra.", categoria: "Participación", icono: Vote, badge: "Anónimo" },
  { to: "/mapa", titulo: "Mapa de Colombia", desc: "Contratación pública por departamento, con escala y detalle.", categoria: "Territorio", icono: MapPinned, badge: "33 dptos." },
  { to: "/mapa#ranking", titulo: "Ranking territorial", desc: "Los departamentos con más procesos y mayor valor referencial.", categoria: "Territorio", icono: Map, badge: "Ranking" },
  { to: "/mapa?dpto=Antioquia", titulo: "Detalle departamental", desc: "Abre un departamento y compara su contratación con el total nacional.", categoria: "Territorio", icono: MapPinned, badge: "Antioquia" },
  { to: "/fuentes", titulo: "Directorio de fuentes", desc: "Quién produce cada dato, con qué frecuencia y bajo qué prioridad.", categoria: "Transparencia", icono: Radio, badge: "10 fuentes" },
  { to: "/fuentes#bitacora", titulo: "Bitácora de verificación", desc: "Cada ejecución deja registro: estado, duración y registros.", categoria: "Transparencia", icono: Clock, badge: "Auditable" },
  { to: "/fuentes#tiers", titulo: "Prioridad TIER", desc: "TIER 1 estatal, TIER 2 institucional, TIER 3 verificado independiente.", categoria: "Transparencia", icono: ShieldCheck, badge: "Método" },
  { to: "/metodologia", titulo: "Metodología", desc: "Cómo se selecciona, verifica y explica cada dato de SARCOL.", categoria: "Transparencia", icono: BookOpen, badge: "Método" },
  { to: "/metodologia#glosario", titulo: "Glosario", desc: "Qué significa cada término técnico y qué no significa.", categoria: "Transparencia", icono: FileText, badge: "Glosario" },
  { to: "/datos-abiertos", titulo: "Datos abiertos", desc: "Descargas CSV, API pública y citación de SARCOL.", categoria: "Sistema", icono: Download, badge: "Abierto" },
  { to: "/datos-abiertos#api", titulo: "API pública", desc: "Endpoints documentados para indicadores, historia, mapa y búsqueda.", categoria: "Sistema", icono: Terminal, badge: "REST" },
  { to: "/datos-abiertos#descargas", titulo: "Descargas CSV", desc: "Indicadores, historia, problemáticas y contratación por departamento.", categoria: "Sistema", icono: FileJson, badge: "CSV" },
  { to: "/buscar", titulo: "Buscador global", desc: "Una consulta recorre indicadores, historia, problemas y territorios.", categoria: "Sistema", icono: Search, badge: "⌘K" },
  { to: "/metodologia#principios", titulo: "Principios SARCOL", desc: "Sin comentarios, sin contacto, doble explicación y voto anónimo.", categoria: "Sistema", icono: ShieldCheck, badge: "Carta" },
  { to: "/metodologia#principios", titulo: "Acerca de SARCOL", desc: "Qué es una entidad regulatoria de información pública y por qué existe.", categoria: "Sistema", icono: Landmark, badge: "Institución" },
];

const CATEGORIAS = ["Todos", "Sala de situación", "Datos", "Memoria", "Participación", "Territorio", "Transparencia", "Sistema"];

export default function Herramientas() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return INSTRUMENTOS.filter((i) => {
      const okCat = categoria === "Todos" || i.categoria === categoria;
      const okQ = !q || normalizar(`${i.titulo} ${i.desc} ${i.categoria} ${i.badge}`).includes(q);
      return okCat && okQ;
    });
  }, [busqueda, categoria]);

  return (
    <main>
      <PageHeader
        kicker="Catálogo de instrumentos · 02"
        title={<>Un catálogo que <span className="text-red">no tiene botones muertos.</span></>}
        description="Cada instrumento abre una vista real y responde una pregunta distinta. No hay herramientas decorativas: si aparece aquí, funciona, tiene fuente y se puede auditar."
        actions={
          <>
            <Button to="/panel" variant="primary">Abrir panel <ArrowRight size={14} /></Button>
            <Button to="/datos-abiertos" variant="soft">Ver API <Terminal size={14} /></Button>
          </>
        }
        meta={
          <>
            <Badge tone="red">{INSTRUMENTOS.length} instrumentos</Badge>
            <Badge tone="blue">{CATEGORIAS.length - 1} categorías</Badge>
            <Badge tone="yellow">Sin botones decorativos</Badge>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-4 border border-line bg-paper2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 border border-line bg-paper px-3 py-2 sm:w-80">
            <Search size={15} className="text-red" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar instrumentos…"
              className="w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted/70"
              aria-label="Filtrar instrumentos"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`rounded-[2px] border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${
                  categoria === c ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
          <span>{filtrados.length} instrumentos disponibles</span>
          <span>Haz clic en cualquiera para abrirlo</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((t, i) => (
            <Reveal key={t.to + t.titulo} delay={(i % 9) * 0.03}>
              <Link
                to={t.to}
                className="group flex h-full flex-col border border-line bg-paper2 p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[6px_6px_0_0_rgba(20,21,24,0.09)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center border border-line bg-paper text-red transition-colors group-hover:bg-red group-hover:text-paper2">
                    <t.icono size={18} />
                  </span>
                  <Badge tone={t.categoria === "Participación" ? "red" : t.categoria === "Datos" ? "blue" : "yellow"}>{t.badge}</Badge>
                </div>
                <h3 className="mt-5 font-display text-[1.1rem] font-bold leading-tight text-ink group-hover:text-red">{t.titulo}</h3>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted">{t.desc}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                  <span>{t.categoria}</span>
                  <span className="flex items-center gap-1 group-hover:text-red">Abrir <ArrowUpRight size={11} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="mt-6 border border-dashed border-line2 bg-paper2/60 px-6 py-14 text-center">
            <p className="font-display text-lg font-bold text-ink">No hay instrumentos con ese filtro</p>
            <p className="mt-1 text-[12.5px] text-muted">Prueba con otra categoría o limpia la búsqueda.</p>
            <Button variant="soft" className="mt-4" onClick={() => { setBusqueda(""); setCategoria("Todos"); }}>Limpiar filtros</Button>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-paper2/50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <SectionHeader
            kicker="Cómo usar el catálogo"
            title={<>Empieza por la pregunta, <span className="text-blue2">no por la herramienta.</span></>}
            description="No necesitas conocer todos los instrumentos. Elige la pregunta que tienes y SARCOL te lleva al dato, a la fuente y al debate."
          />
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {[
              { n: "01", t: "¿Qué está pasando?", d: "Abre la sala de situación o el estado actual. Los KPIs muestran el último dato y su fecha.", to: "/panel", cta: "Ir al panel" },
              { n: "02", t: "¿De dónde sale?", d: "Cada tarjeta enlaza a su fuente. La bitácora muestra la última verificación y si falló.", to: "/fuentes", cta: "Ver fuentes" },
              { n: "03", t: "¿Qué hago con eso?", d: "Problemáticas y soluciones convierten el dato en debate. El voto es anónimo y sin centro.", to: "/problematicas", cta: "Participar" },
            ].map((c) => (
              <Link key={c.n} to={c.to} className="group border border-line bg-paper2 p-5 transition-colors hover:border-red/40">
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-red">{c.n}</span>
                  <ArrowUpRight size={15} className="text-muted group-hover:text-red" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{c.t}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{c.d}</p>
                <span className="mt-3 inline-block font-mono text-[9px] uppercase tracking-[0.1em] text-muted group-hover:text-red">{c.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-ink bg-ink px-5 py-6 text-paper">
          <div>
            <Kicker className="text-yellow">Buscador global</Kicker>
            <p className="mt-1 font-display text-xl font-bold">Si no sabes dónde está, pregúntale a SARCOL.</p>
          </div>
          <Button to="/buscar" variant="yellow">Buscar en todo el sistema <Search size={14} /></Button>
        </div>
      </section>
    </main>
  );
}
