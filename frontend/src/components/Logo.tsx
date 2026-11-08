import { Link } from "react-router-dom";

/** Marca SARCOL: sello de red + acrónimo + franja tricolor. */
export default function Logo({ compacto = false, oscuro = false }: { compacto?: boolean; oscuro?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="SARCOL — inicio">
      <span className="relative inline-flex items-center justify-center">
        <img
          src="/logo.png"
          alt=""
          className={`${compacto ? "h-9 w-9" : "h-11 w-11"} object-contain mix-blend-multiply transition-transform duration-500 group-hover:rotate-45`}
        />
        <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-red" />
      </span>
      <div className="leading-none">
        <div className={`font-display text-[17px] font-extrabold tracking-[0.2em] ${oscuro ? "text-paper" : "text-ink"}`}>
          SARCOL
        </div>
        {!compacto && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="h-[3px] w-5 bg-red" />
            <span className="h-[3px] w-5 bg-yellow2" />
            <span className="h-[3px] w-5 bg-blue2" />
          </div>
        )}
      </div>
    </Link>
  );
}
