import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, ChevronDown, Filter, Lightbulb, Scale, ShieldCheck, TriangleAlert, Vote,
} from "lucide-react";
import { PageHeader, Badge, Button, Kicker, Skeleton, EmptyState } from "../components/ui";
import DualView from "../components/DualView";
import VotoPanel from "../components/VotoPanel";
import { useApi } from "../lib/useApi";
import type { Solucion } from "../lib/types";

const NIVELES = ["Todas", "nacional", "departamental", "municipal"];

export default function Soluciones() {
  const { data, cargando } = useApi<{ soluciones: Solucion[] }>("/soluciones");
  const [params] = useSearchParams();
  const slug = params.get("slug");
  const [nivel, setNivel] = useState("Todas");
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!slug) return;
    setAbiertos((prev) => new Set(prev).add(slug));
    const t = window.setTimeout(() => {
      document.getElementById(`sol-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 450);
    return () => window.clearTimeout(t);
  }, [slug, data]);

  const soluciones = useMemo(() => {
    const todas = data?.soluciones || [];
    return nivel === "Todas" ? todas : todas.filter((s) => s.nivel === nivel);
  }, [data, nivel]);

  const total = data?.soluciones.length || 0;
  const totalVotos = (data?.soluciones || []).reduce((a, s) => a + s.votos_acuerdo + s.votos_desacuerdo, 0);

  function toggle(s: string) {
    setAbiertos((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  }

  return (
    <main>
      <PageHeader
        kicker="Debate público · 06"
        title={<>Propuestas que <span className="text-blue2">parten de datos.</span></>}
        description="Para cada problemática, una propuesta argumentada y un respaldo técnico. La interfaz no pide opiniones ni comentarios: solo muestra el análisis y recoge un voto anónimo de acuerdo o desacuerdo."
        actions={
          <>
            <Button to="/problematicas" variant="soft"><TriangleAlert size={14} /> Ver problemáticas</Button>
            <Button to="/metodologia#voto" variant="primary"><Scale size={14} /> Cómo votamos</Button>
          </>
        }
        meta={
          <>
            <Badge tone="red"><Lightbulb size={11} /> {total} soluciones</Badge>
            <Badge tone="yellow"><Vote size={11} /> {totalVotos} votos</Badge>
            <Badge tone="blue"><ShieldCheck size={11} /> Sin comentarios</Badge>
          </>
        }
      />

      <section className="border-b border-line bg-paper2/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={12} className="mr-1 text-red" />
            {NIVELES.map((n) => (
              <button
                key={n}
                onClick={() => setNivel(n)}
                className={`border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${
                  nivel === n ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {n === "Todas" ? "Todas" : n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
            <span>2 opciones · sin centro</span>
            <span>1 dispositivo · 1 voto</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_280px]">
        <div>
          {cargando && !data && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>}
          {soluciones.map((s) => {
            const abierto = abiertos.has(s.slug);
            const totalV = s.votos_acuerdo + s.votos_desacuerdo;
            const pctAcuerdo = totalV ? Math.round((s.votos_acuerdo / totalV) * 100) : 0;
            return (
              <article key={s.slug} id={`sol-${s.slug}`} className={`mb-4 border bg-paper2 transition-colors ${abierto ? "border-ink/30" : "border-line hover:border-line2"}`}>
                <button onClick={() => toggle(s.slug)} className="w-full px-5 py-4 text-left" aria-expanded={abierto}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="red"><Lightbulb size={10} /> Solución</Badge>
                    <Badge tone="line">{s.nivel} · {s.ambito}</Badge>
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{s.categoria}</span>
                    {s.es_decision_activa && <Badge tone="yellow">Decisión activa</Badge>}
                    <ChevronDown size={15} className={`ml-auto text-muted transition-transform ${abierto ? "rotate-180" : ""}`} />
                  </div>
                  <h2 className="mt-2.5 font-display text-[1.2rem] font-bold leading-snug tracking-[-0.01em] text-ink">{s.titulo}</h2>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{s.resumen_simple}</p>
                  <div className="mt-3 flex items-center gap-3 border-t border-line pt-2.5">
                    <div className="flex-1">
                      <div className="flex justify-between font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted">
                        <span>Acuerdo</span><span>{pctAcuerdo}%</span>
                      </div>
                      <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-paper3">
                        <div className="h-full rounded-full bg-blue2" style={{ width: `${pctAcuerdo}%` }} />
                      </div>
                    </div>
                    <span className="font-mono text-[9px] tabular-nums text-muted">{totalV} votos</span>
                  </div>
                </button>

                {abierto && (
                  <div className="border-t border-line px-5 py-5">
                    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                      <div>
                        <Kicker className="text-red">La propuesta y su respaldo</Kicker>
                        <div className="mt-2">
                          <DualView
                            simple={s.solucion_propuesta}
                            tecnico={s.solucion_analisis}
                            fuentes={s.fuentes}
                            nota="La vista simple enuncia la propuesta en lenguaje directo; el respaldo completo desarrolla el argumento, los límites y las fuentes."
                          />
                        </div>
                        <div className="mt-4 border-l-2 border-blue2 bg-blue/25 px-3 py-2">
                          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-blue2">Propuesta verificable</div>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-ink/80">{s.solucion_propuesta}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button to={`/problematicas?slug=${s.slug}`} variant="soft">Ver problemática <ArrowRight size={13} /></Button>
                          <Button to={`/buscar?q=${encodeURIComponent(s.titulo)}`} variant="ghost">Buscar contexto</Button>
                        </div>
                      </div>
                      <div className="self-start">
                        <VotoPanel entidad="solucion" entidadId={s.slug} />
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {!cargando && soluciones.length === 0 && (
            <EmptyState title="Sin soluciones con ese nivel" description="Cambia el filtro para ver todas las propuestas disponibles." action={<Button variant="soft" onClick={() => setNivel("Todas")}>Ver todas</Button>} />
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <div className="border border-line bg-paper2 p-4">
            <Kicker>Reglas del debate</Kicker>
            <ul className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-muted">
              <li className="flex gap-2"><span className="text-red">01</span> Sin comentarios ni respuestas.</li>
              <li className="flex gap-2"><span className="text-red">02</span> Sin cuentas ni contacto.</li>
              <li className="flex gap-2"><span className="text-red">03</span> Dos opciones: acuerdo o desacuerdo.</li>
              <li className="flex gap-2"><span className="text-red">04</span> Un dispositivo, un voto.</li>
              <li className="flex gap-2"><span className="text-red">05</span> Si hay empate, se muestra.</li>
            </ul>
          </div>
          <div className="border border-line bg-yellow/30 p-4">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/70">
              <ShieldCheck size={12} className="text-red" /> Imparcialidad
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink/70">
              La propuesta no es una orden. Es una hipótesis de solución con límites explícitos. El voto mide
              acuerdo, no valida el dato: los datos ya tienen fuente.
            </p>
          </div>
          <div className="border border-line bg-paper2 p-4">
            <Kicker>Atajos</Kicker>
            <div className="mt-2 space-y-1.5 font-mono text-[10px] uppercase tracking-[0.06em]">
              <Link to="/problematicas" className="flex items-center justify-between border-b border-line py-1.5 text-muted hover:text-red"><span>Problemáticas</span><ArrowRight size={11} /></Link>
              <Link to="/mapa" className="flex items-center justify-between border-b border-line py-1.5 text-muted hover:text-red"><span>Mapa territorial</span><ArrowRight size={11} /></Link>
              <Link to="/fuentes" className="flex items-center justify-between py-1.5 text-muted hover:text-red"><span>Fuentes</span><ArrowRight size={11} /></Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
