import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { to: "/herramientas", texto: "Herramientas" },
  { to: "/estado-actual", texto: "Estado Actual" },
  { to: "/historia", texto: "Historia" },
  { to: "/problematicas", texto: "Problemáticas" },
  { to: "/soluciones", texto: "Soluciones" },
  { to: "/mapa", texto: "Mapa" },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-borde bg-tinta/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Logo compacto />
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-[13px] font-medium uppercase tracking-wider transition-colors ${
                  isActive ? "bg-panel2 text-amarillo" : "text-muted hover:text-texto"
                }`
              }
            >
              {l.texto}
            </NavLink>
          ))}
        </nav>
        <button
          className="rounded-md border border-borde p-2 text-muted lg:hidden"
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir menú"
        >
          {abierto ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {abierto && (
        <nav className="border-t border-borde bg-panel px-5 pb-4 pt-2 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setAbierto(false)}
              className="block rounded-md px-3 py-3 text-sm font-medium uppercase tracking-wider text-muted hover:text-texto"
            >
              {l.texto}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
