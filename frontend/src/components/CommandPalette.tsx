import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, ArrowRight, Building2, FileText, History, LayoutDashboard, Lightbulb,
  MapPinned, Search, ShieldCheck, TriangleAlert, X,
} from "lucide-react";
import { useApi } from "../lib/useApi";
import type { Busqueda, BusquedaItem } from "../lib/types";

const ATAJOS: BusquedaItem[] = [
  { id: "panel", titulo: "Sala de situación", subtitulo: "Pulso del país en vivo", ruta: "/panel", badge: "Panel", tipo: "pagina" },
  { id: "estado", titulo: "Estado actual", subtitulo: "63 indicadores verificados", ruta: "/estado-actual", badge: "Datos", tipo: "pagina" },
  { id: "historia", titulo: "Historia", subtitulo: "1810 → hoy", ruta: "/historia", badge: "Memoria", tipo: "pagina" },
  { id: "problematicas", titulo: "Problemáticas", subtitulo: "Pirámide nacional → municipal", ruta: "/problematicas", badge: "Voto", tipo: "pagina" },
  { id: "mapa", titulo: "Mapa · Regiones", subtitulo: "Contratación por departamento", ruta: "/mapa", badge: "Territorio", tipo: "pagina" },
  { id: "fuentes", titulo: "Fuentes y bitácora", subtitulo: "Sala de máquinas", ruta: "/fuentes", badge: "Transparencia", tipo: "pagina" },
];

const ICONOS: Record<string, typeof Activity> = {
  indicador: Activity,
  historia: History,
  problematica: TriangleAlert,
  solucion: Lightbulb,
  departamento: MapPinned,
  pagina: LayoutDashboard,
};

export default function CommandPalette({ abierta, cerrar }: { abierta: boolean; cerrar: () => void }) {
  const [q, setQ] = useState("");
  const [consulta, setConsulta] = useState("");
  const [activo, setActivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!abierta) {
      setQ("");
      setConsulta("");
      setActivo(0);
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [abierta]);

  useEffect(() => {
    const id = window.setTimeout(() => setConsulta(q.trim()), 180);
    return () => window.clearTimeout(id);
  }, [q]);

  const { data, cargando } = useApi<Busqueda>(
    abierta && consulta.length >= 2 ? `/buscar?q=${encodeURIComponent(consulta)}&limite=5` : null,
  );

  const grupos = useMemo(() => {
    if (consulta.length >= 2) return data?.grupos || [];
    return [{ tipo: "pagina", etiqueta: "Accesos rápidos", items: ATAJOS }];
  }, [consulta, data]);

  const planos = useMemo(() => grupos.flatMap((g) => g.items), [grupos]);

  useEffect(() => { setActivo(0); }, [consulta, data]);

  function ir(item: BusquedaItem) {
    navigate(item.ruta);
    cerrar();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((i) => Math.min(planos.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && planos[activo]) {
      e.preventDefault();
      ir(planos[activo]);
    } else if (e.key === "Escape") {
      cerrar();
    }
  }

  let indice = -1;

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/50 px-4 pt-[10vh] backdrop-blur-[3px]"
          onClick={cerrar}
          role="dialog"
          aria-modal="true"
          aria-label="Buscador global de SARCOL"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl border border-line bg-paper2 shadow-[10px_10px_0_0_rgba(20,21,24,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <Search size={18} className="shrink-0 text-red" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Busca un indicador, un hecho, una problemática, un departamento…"
                className="w-full bg-transparent font-body text-[14px] text-ink outline-none placeholder:text-muted/70"
                aria-label="Término de búsqueda"
              />
              <button onClick={cerrar} className="rounded-[2px] border border-line p-1.5 text-muted hover:text-ink" aria-label="Cerrar buscador">
                <X size={15} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {cargando && consulta.length >= 2 && (
                <div className="px-3 py-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Buscando en el registro…</div>
              )}
              {!cargando && consulta.length >= 2 && planos.length === 0 && (
                <div className="px-3 py-10 text-center">
                  <p className="font-display text-lg font-bold text-ink">Sin coincidencias</p>
                  <p className="mt-1 text-[12px] text-muted">Prueba con “pobreza”, “desempleo”, “Antioquia” o “salud”.</p>
                </div>
              )}
              {grupos.map((grupo) => (
                <div key={grupo.tipo} className="mb-1">
                  <div className="px-3 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{grupo.etiqueta}</div>
                  {grupo.items.map((item) => {
                    indice += 1;
                    const Icono = ICONOS[item.tipo] || FileText;
                    const esActivo = indice === activo;
                    return (
                      <button
                        key={`${grupo.tipo}-${item.id}`}
                        onMouseEnter={() => setActivo(indice)}
                        onClick={() => ir(item)}
                        className={`flex w-full items-center gap-3 rounded-[2px] px-3 py-2.5 text-left transition-colors ${esActivo ? "bg-yellow/50" : "hover:bg-paper"}`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center border ${esActivo ? "border-red/30 bg-red text-paper2" : "border-line bg-paper text-muted"}`}>
                          <Icono size={13} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ink">{item.titulo}</span>
                          <span className="block truncate text-[10.5px] text-muted">{item.subtitulo}</span>
                        </span>
                        <span className="hidden shrink-0 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted sm:inline">{item.badge}</span>
                        <ArrowRight size={12} className={esActivo ? "text-red" : "text-line2"} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-paper px-4 py-2.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">
              <span>↑ ↓ navegar · Enter abrir · Esc cerrar</span>
              <span className="flex items-center gap-1"><ShieldCheck size={10} /> Búsqueda sobre datos verificados</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
