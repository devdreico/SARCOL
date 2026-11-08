import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, CheckCircle2, Clock, ExternalLink, Radio, RefreshCw,
  ShieldCheck, TriangleAlert, XCircle,
} from "lucide-react";
import { useLive } from "../components/LiveProvider";
import {
  PageHeader, Badge, Button, Kicker, SectionHeader, Skeleton, StatusDot, TierBadge,
} from "../components/ui";
import { useApi } from "../lib/useApi";
import { apiPost } from "../lib/api";
import type { Actividad, Fuente } from "../lib/types";
import { duracion, fechaHora, haceCuanto } from "../lib/format";

const TIERS = [
  {
    n: 1,
    titulo: "Estatal",
    desc: "La base de la verdad objetiva: entidades del Estado que producen el dato primario.",
    ejemplos: "DANE · Ministerios · Registraduría",
    tone: "yellow" as const,
  },
  {
    n: 2,
    titulo: "Institucional",
    desc: "El marco legal y operativo real: contratación, regulación, emisor y rama judicial.",
    ejemplos: "SECOP II · Superfinanciera · Rama Judicial",
    tone: "blue" as const,
  },
  {
    n: 3,
    titulo: "Verificado independiente",
    desc: "Contraste y comparación: series internacionales y periodismo de datos con método público.",
    ejemplos: "Banco Mundial · La Silla Vacía · Cuestión Pública",
    tone: "red" as const,
  },
];

export default function Fuentes() {
  const { pulso } = useLive();
  const { data, refetch, cargando } = useApi<{ fuentes: Fuente[] }>("/meta/fuentes");
  const { data: actData, refetch: refetchAct } = useApi<{ actividad: Actividad[] }>("/meta/actividad?limite=40");
  const [filtro, setFiltro] = useState<"todas" | "en vivo" | "contexto">("todas");
  const [refrescando, setRefrescando] = useState(false);
  const [aviso, setAviso] = useState("");

  const fuentes = useMemo(() => {
    const lista = data?.fuentes || pulso?.fuentes || [];
    return filtro === "todas" ? lista : lista.filter((f) => f.tipo === filtro);
  }, [data, pulso, filtro]);

  const actividad = actData?.actividad || pulso?.actividad || [];
  const enVivo = (data?.fuentes || pulso?.fuentes || []).filter((f) => f.tipo === "en vivo");
  const ok = enVivo.filter((f) => f.estado === "ok").length;
  const conError = enVivo.filter((f) => f.estado === "error").length;

  async function refrescar() {
    setRefrescando(true);
    setAviso("");
    try {
      const r = await apiPost<{ mensaje: string }>("/meta/refrescar", {});
      setAviso(r.mensaje);
      window.setTimeout(() => {
        setRefrescando(false);
        refetch();
        refetchAct();
      }, 5000);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo iniciar la verificación.");
      setRefrescando(false);
    }
  }

  return (
    <main>
      <PageHeader
        kicker="Transparencia · 08"
        title={<>La sala de máquinas <span className="text-red">de SARCOL.</span></>}
        description="Qué fuentes usamos, en qué orden de prioridad, cuándo se ejecutaron y qué pasó. Si una fuente falla, se ve. Si un dato se actualiza, queda registrado. La confianza no se pide: se muestra."
        actions={
          <>
            <Button variant="primary" onClick={refrescar} disabled={refrescando}>
              <RefreshCw size={14} className={refrescando ? "animate-spin" : ""} />
              {refrescando ? "Verificando…" : "Verificar ahora"}
            </Button>
            <Button to="/metodologia" variant="soft">Metodología <ArrowRight size={14} /></Button>
          </>
        }
        meta={
          <>
            <Badge tone={ok === enVivo.length && enVivo.length > 0 ? "green" : "red"}>
              <StatusDot estado={ok === enVivo.length && enVivo.length > 0 ? "ok" : "error"} />
              {ok}/{enVivo.length} fuentes en vivo operativas
            </Badge>
            {conError > 0 && <Badge tone="red"><TriangleAlert size={11} /> {conError} con error</Badge>}
            <Badge tone="line"><Clock size={11} /> {pulso?.actualizado_en ? haceCuanto(pulso.actualizado_en) : "sin registro"}</Badge>
            {aviso && <Badge tone="yellow">{aviso}</Badge>}
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-paper2 p-4">
          <div className="flex items-center gap-1.5">
            {[
              { id: "todas", label: "Todas" },
              { id: "en vivo", label: "En vivo" },
              { id: "contexto", label: "Contexto" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id as typeof filtro)}
                className={`border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${
                  filtro === f.id ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green" /> {ok} ok</span>
            <span className="flex items-center gap-1"><XCircle size={11} className="text-red" /> {conError} error</span>
            <span>{fuentes.length} fuentes</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cargando && !fuentes.length && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
          {fuentes.map((f) => (
            <article key={f.key} className="group flex h-full flex-col border border-line bg-paper2 p-4 transition-colors hover:border-line2">
              <div className="flex items-start justify-between gap-2">
                <TierBadge tier={f.tier} />
                <div className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">
                  <StatusDot estado={f.estado} />
                  {f.estado === "ok" ? "operativa" : f.estado === "error" ? "con error" : "sin ejecución"}
                </div>
              </div>
              <h2 className="mt-3 font-display text-[14px] font-bold leading-snug text-ink">{f.nombre}</h2>
              <p className="mt-1.5 flex-1 text-[11.5px] leading-relaxed text-muted">{f.descripcion}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-2 font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted">
                <div><span className="text-muted/60">Frecuencia</span><div className="mt-0.5 text-ink/70">{f.frecuencia}</div></div>
                <div><span className="text-muted/60">Cobertura</span><div className="mt-0.5 text-ink/70">{f.cobertura}</div></div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2 font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted">
                <span>{f.ultima_ejecucion ? haceCuanto(f.ultima_ejecucion) : "sin ejecución"}</span>
                <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-red hover:underline">Abrir <ExternalLink size={9} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="tiers" className="border-y border-line bg-paper2/50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <SectionHeader
            kicker="Prioridad de fuentes"
            title={<>Primero lo estatal. Luego lo institucional. <span className="text-red">Luego el contraste.</span></>}
            description="No todas las fuentes pesan igual. Este orden evita que una opinión bien escrita compita con un registro administrativo."
          />
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.n} className={`border bg-paper2 p-5 ${t.n === 1 ? "border-yellow2/70" : t.n === 2 ? "border-blue2/25" : "border-red/25"}`}>
                <div className="flex items-start justify-between">
                  <span className={`inline-flex h-9 w-9 items-center justify-center border font-display text-sm font-extrabold ${t.n === 1 ? "border-yellow2 bg-yellow text-ink" : t.n === 2 ? "border-blue2/30 bg-blue text-blue2" : "border-red/30 bg-red/5 text-red"}`}>T{t.n}</span>
                  <Badge tone={t.tone}>{t.titulo}</Badge>
                </div>
                <p className="mt-4 text-[12.5px] leading-relaxed text-muted">{t.desc}</p>
                <div className="mt-3 border-t border-line pt-2 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{t.ejemplos}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="bitacora" className="mx-auto max-w-7xl px-5 py-12">
        <SectionHeader
          kicker="Bitácora de verificación"
          title={<>Cada ejecución, <span className="text-blue2">con nombre y tiempo.</span></>}
          description="Registro crudo de las últimas ejecuciones: fuente, estado, duración y cantidad de registros. No se edita para que se vea mejor."
          action={<Button variant="soft" onClick={() => { refetch(); refetchAct(); }}><RefreshCw size={13} /> Actualizar</Button>}
        />
        <div className="mt-6 border border-line bg-paper2">
          <div className="grid grid-cols-[1fr_90px_90px] gap-2 border-b border-line bg-paper px-4 py-2 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted sm:grid-cols-[1fr_110px_100px_100px]">
            <span>Fuente / detalle</span>
            <span className="hidden sm:block">Duración</span>
            <span>Registros</span>
            <span className="text-right">Cuándo</span>
          </div>
          {actividad.map((a, i) => (
            <div key={`${a.fuente}-${i}`} className="grid grid-cols-[1fr_90px_90px] items-center gap-2 border-b border-line/70 px-4 py-2.5 last:border-0 sm:grid-cols-[1fr_110px_100px_100px]">
              <div className="flex min-w-0 items-center gap-2">
                <StatusDot estado={a.estado} />
                <div className="min-w-0">
                  <div className="truncate text-[11.5px] font-semibold text-ink">{a.fuente}</div>
                  <div className="truncate font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted">{a.detalle || "sin detalle"}</div>
                </div>
              </div>
              <span className="hidden font-mono text-[9px] text-muted sm:block">{duracion(a.duracion_ms)}</span>
              <span className="font-mono text-[9px] tabular-nums text-muted">{a.registros ? a.registros.toLocaleString("es-CO") : "—"}</span>
              <span className="text-right font-mono text-[8.5px] text-muted">{haceCuanto(a.ultima_ejecucion)}</span>
            </div>
          ))}
          {!actividad.length && <div className="px-4 py-12 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Sin registros de actividad</div>}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          <span className="flex items-center gap-1"><Activity size={11} className="text-red" /> {actividad.length} ejecuciones recientes</span>
          <span>Última verificación: {pulso?.actualizado_en ? fechaHora(pulso.actualizado_en) : "—"}</span>
        </div>
      </section>

      <section className="border-y border-line bg-yellow/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 text-red" />
            <div>
              <Kicker className="text-red">Regla de oro</Kicker>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink/80">
                Si una fuente no responde, SARCOL no rellena el dato. Muestra el último valor verificado, marca la
                alerta y deja constancia en esta bitácora.
              </p>
            </div>
          </div>
          <Button to="/metodologia" variant="ink">Leer la metodología <ArrowRight size={14} /></Button>
        </div>
      </section>
    </main>
  );
}
