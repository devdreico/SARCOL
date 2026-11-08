import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Activity, ChevronDown, Database, ExternalLink, FileText, History, LayoutDashboard,
  MapPinned, Menu, Search, ShieldCheck, TriangleAlert, Lightbulb, X, Radio,
} from "lucide-react";
import Logo from "./Logo";
import CommandPalette from "./CommandPalette";
import { StatusDot } from "./ui";
import { useLive } from "./LiveProvider";
import { fechaHora, haceCuanto } from "../lib/format";

const PRINCIPALES = [
  { to: "/panel", texto: "Panel", icono: LayoutDashboard },
  { to: "/herramientas", texto: "Instrumentos", icono: Database },
  { to: "/estado-actual", texto: "Estado", icono: Activity },
  { to: "/historia", texto: "Historia", icono: History },
  { to: "/problematicas", texto: "Problemáticas", icono: TriangleAlert },
  { to: "/soluciones", texto: "Soluciones", icono: Lightbulb },
  { to: "/mapa", texto: "Mapa", icono: MapPinned },
];

const SECUNDARIOS = [
  { to: "/fuentes", texto: "Fuentes y bitácora", icono: Radio },
  { to: "/metodologia", texto: "Metodología", icono: ShieldCheck },
  { to: "/datos-abiertos", texto: "Datos abiertos · API", icono: FileText },
];

function SystemBar() {
  const { pulso, conectado } = useLive();
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setAhora(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const hora = ahora.toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const estado = pulso?.estado || "sin-datos";
  return (
    <div className="border-b border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-yellow">
            <StatusDot estado={estado === "ok" ? "ok" : estado === "degradado" ? "error" : "sin"} />
            SARCOL · {estado === "ok" ? "en vivo" : estado === "degradado" ? "fuente con alerta" : "sin verificación"}
          </span>
          <span className="hidden text-paper/45 sm:inline">Sistema de datos públicos</span>
        </div>
        <div className="flex items-center gap-3 text-paper/60">
          <span className="hidden md:inline">
            {pulso?.proxima_ejecucion ? `Próxima verificación ${fechaHora(pulso.proxima_ejecucion)}` : "Verificación diaria 05:00 COL"}
          </span>
          <span className="hidden text-paper/35 md:inline">·</span>
          <span className="text-paper/85 tabular-nums">{hora} COL</span>
          <span className={`hidden items-center gap-1 sm:flex ${conectado ? "text-green2" : "text-paper/40"}`}>
            <span className={`h-1 w-1 rounded-full ${conectado ? "bg-green2" : "bg-paper/30"}`} />
            {conectado ? "SSE" : "polling"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Navbar({ onBuscar }: { onBuscar: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [masAbierto, setMasAbierto] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setAbierto(false);
    setMasAbierto(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2.5">
        <Logo compacto />
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Navegación principal">
          {PRINCIPALES.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative rounded-[2px] px-2.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                  isActive ? "text-red" : "text-ink/65 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.texto}
                  {isActive && <span className="absolute inset-x-2.5 -bottom-[3px] h-[2px] bg-red" />}
                </>
              )}
            </NavLink>
          ))}
          <div className="relative">
            <button
              onClick={() => setMasAbierto(!masAbierto)}
              className="flex items-center gap-1 rounded-[2px] px-2.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink/65 transition-colors hover:text-ink"
              aria-expanded={masAbierto}
            >
              Más <ChevronDown size={13} className={masAbierto ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            <AnimatePresence>
              {masAbierto && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-full z-50 mt-1 w-60 border border-line bg-paper2 p-1 shadow-[6px_6px_0_0_rgba(20,21,24,0.1)]"
                >
                  {SECUNDARIOS.map((l) => (
                    <Link key={l.to} to={l.to} className="flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium text-ink/75 transition-colors hover:bg-yellow/40 hover:text-ink">
                      <l.icono size={14} className="text-red" /> {l.texto}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={onBuscar}
            className="hidden items-center gap-2 rounded-[2px] border border-line bg-paper2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors hover:border-ink/40 hover:text-ink sm:flex"
            aria-label="Buscar en SARCOL"
          >
            <Search size={13} /> Buscar
            <span className="ml-2 rounded-[2px] border border-line px-1.5 py-0.5 text-[8.5px] text-muted">⌘K</span>
          </button>
          <button
            onClick={onBuscar}
            className="rounded-[2px] border border-line p-2 text-muted sm:hidden"
            aria-label="Buscar"
          >
            <Search size={16} />
          </button>
          <button
            className="rounded-[2px] border border-line p-2 text-ink xl:hidden"
            onClick={() => setAbierto(!abierto)}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
          >
            {abierto ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {abierto && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-paper2 xl:hidden"
            aria-label="Navegación móvil"
          >
            <div className="mx-auto grid max-w-7xl gap-0.5 px-5 py-3">
              {[...PRINCIPALES, ...SECUNDARIOS].map((l) => (
                <Link key={l.to} to={l.to} className="flex items-center gap-3 border-b border-line/60 px-2 py-3 text-[13px] font-medium text-ink/80 last:border-0 hover:text-red">
                  <l.icono size={15} className="text-red" /> {l.texto}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const { pulso } = useLive();
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red/15 blur-[80px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo oscuro />
            <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-paper/60">
              Sociedad Autónoma Regulatoria de Cumplimiento en Operaciones Legales.
              Datos verificados, doble explicación y voto anónimo.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="border border-paper/15 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-paper/45">TIER 1 · Estatal</span>
              <span className="border border-paper/15 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-paper/45">TIER 2 · Institucional</span>
              <span className="border border-paper/15 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-paper/45">TIER 3 · Verificado</span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-yellow">Instrumentos</div>
            <ul className="mt-3 space-y-2 text-[12px] text-paper/60">
              {PRINCIPALES.map((l) => <li key={l.to}><Link to={l.to} className="link-underline hover:text-paper">{l.texto}</Link></li>)}
            </ul>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-yellow">Transparencia</div>
            <ul className="mt-3 space-y-2 text-[12px] text-paper/60">
              {SECUNDARIOS.map((l) => <li key={l.to}><Link to={l.to} className="link-underline hover:text-paper">{l.texto}</Link></li>)}
              <li><a href="/docs" target="_blank" rel="noreferrer" className="link-underline inline-flex items-center gap-1 hover:text-paper">OpenAPI <ExternalLink size={10} /></a></li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-yellow">Principios</div>
            <p className="mt-3 text-[12px] leading-relaxed text-paper/60">
              Sin comentarios. Sin contacto. Solo datos y voto.<br />
              1 dispositivo, 1 voto. Si el país está dividido, SARCOL lo muestra.
            </p>
            <div className="mt-4 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-paper/40">
              <StatusDot estado={pulso?.estado === "ok" ? "ok" : "error"} />
              {pulso?.conteos?.votos ?? 0} votos registrados
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 pt-5 font-mono text-[9px] uppercase tracking-[0.1em] text-paper/35">
          <span>© 2026 SARCOL · Hecho en Colombia</span>
          <span>Última verificación: {pulso?.actualizado_en ? haceCuanto(pulso.actualizado_en) : "—"}</span>
          <span>v2.0 · Datos abiertos</span>
        </div>
      </div>
    </footer>
  );
}

export default function Shell() {
  const [paletteAbierta, setPaletteAbierta] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteAbierta((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Saltar al contenido
      </a>
      <SystemBar />
      <Navbar onBuscar={() => setPaletteAbierta(true)} />
      <main id="contenido" className="min-h-[60vh]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CommandPalette abierta={paletteAbierta} cerrar={() => setPaletteAbierta(false)} />
    </MotionConfig>
  );
}
