import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Compass, FileQuestion, Home, Search } from "lucide-react";
import { MeshBackground } from "../components/Background";
import { Button, Kicker, Sello } from "../components/ui";

const ATAJOS = [
  { to: "/panel", t: "Sala de situación", d: "El pulso del país" },
  { to: "/estado-actual", t: "Estado actual", d: "63 indicadores" },
  { to: "/historia", t: "Historia", d: "1810 → hoy" },
  { to: "/mapa", t: "Mapa", d: "33 departamentos" },
  { to: "/fuentes", t: "Fuentes", d: "Bitácora y TIER" },
];

export default function NotFound() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    navigate(q.trim() ? `/buscar?q=${encodeURIComponent(q.trim())}` : "/buscar");
  }

  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden">
      <MeshBackground />
      <div className="relative mx-auto w-full max-w-5xl px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Sello>Error 404 · Fuera del registro</Sello>
            <div className="mt-4 font-display text-[clamp(6rem,18vw,13rem)] font-black leading-[0.78] tracking-[-0.08em] text-ink">
              4<span className="text-red">0</span>4
            </div>
            <h1 className="mt-4 font-display text-[clamp(1.6rem,3.5vw,2.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
              Esta página no está en el registro.
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">
              Puede que el enlace haya cambiado o que el instrumento todavía no exista. No vamos a inventar una
              página vacía: te damos el mapa para volver al dato.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button to="/panel" variant="primary"><Home size={14} /> Ir al panel</Button>
              <Button to="/buscar" variant="soft"><Search size={14} /> Buscar en SARCOL</Button>
            </div>
          </div>

          <div className="border border-line bg-paper2 p-5 shadow-[8px_8px_0_0_rgba(20,21,24,0.08)]">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <FileQuestion size={17} className="text-red" />
              <div>
                <Kicker className="text-red">Recuperar el rumbo</Kicker>
                <div className="mt-0.5 font-display text-[15px] font-bold text-ink">¿Qué estabas buscando?</div>
              </div>
            </div>
            <form onSubmit={buscar} className="mt-3 flex items-center gap-2 border border-line bg-paper px-3 py-2">
              <Search size={15} className="text-red" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Indicador, hecho, departamento…"
                className="w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted/70"
                aria-label="Buscar desde la página 404"
              />
              <button type="submit" className="shrink-0 border border-ink bg-ink px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.08em] text-paper">Ir</button>
            </form>
            <div className="mt-4">
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted"><Compass size={12} className="text-red" /> Atajos</div>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {ATAJOS.map((a) => (
                  <Link key={a.to} to={a.to} className="group flex items-center justify-between gap-2 border border-line bg-paper px-2.5 py-2 transition-colors hover:border-red/40">
                    <span>
                      <span className="block text-[11.5px] font-semibold text-ink group-hover:text-red">{a.t}</span>
                      <span className="block font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted">{a.d}</span>
                    </span>
                    <ArrowRight size={11} className="text-muted group-hover:text-red" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-3 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">
              Si el enlace venía de SARCOL, la bitácora de fuentes puede explicar el cambio.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
