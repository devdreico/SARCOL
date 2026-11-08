import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Inbox } from "lucide-react";
import { formatear, TIER_ETIQUETA } from "../lib/format";
import Sparkline from "./Sparkline";

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`kicker ${className}`}>{children}</div>;
}

export function Sello({ children }: { children: ReactNode }) {
  return <span className="stamp">{children}</span>;
}

type ButtonVariant = "primary" | "ink" | "outline" | "yellow" | "ghost" | "soft";

const VARIANTES: Record<ButtonVariant, string> = {
  primary: "bg-red text-paper2 border-red hover:bg-red2 hover:border-red2",
  ink: "bg-ink text-paper border-ink hover:bg-ink2 hover:border-ink2",
  outline: "bg-transparent text-ink border-ink/30 hover:bg-ink hover:text-paper",
  yellow: "bg-yellow text-ink border-yellow2/60 hover:bg-yellow2",
  ghost: "bg-transparent text-ink border-transparent hover:bg-ink/5",
  soft: "bg-paper2 text-ink border-line hover:border-ink/40",
};

export function Button({
  children,
  to,
  href,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  const clase = `inline-flex items-center justify-center gap-2 rounded-[2px] border px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTES[variant]} ${className}`;
  if (to) return <Link to={to} className={clase} aria-label={ariaLabel}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={clase} aria-label={ariaLabel}>{children}</a>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clase} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  meta,
}: {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-paper2/70">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue/40 blur-[80px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            <Kicker className="text-red">{kicker}</Kicker>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.8rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-ink text-balance">
              {title}
            </h1>
            {description && (
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-muted text-pretty">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {meta && <div className="mt-7 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
    </header>
  );
}

export function SectionHeader({
  kicker,
  title,
  description,
  action,
  className = "",
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-5 ${className}`}>
      <div className="max-w-2xl">
        {kicker && <Kicker className="text-red">{kicker}</Kicker>}
        <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ink text-balance">
          {title}
        </h2>
        {description && <p className="mt-3 text-[13.5px] leading-relaxed text-muted text-pretty">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "line",
  className = "",
}: {
  children: ReactNode;
  tone?: "line" | "red" | "yellow" | "blue" | "green" | "ink";
  className?: string;
}) {
  const tonos: Record<string, string> = {
    line: "border-line bg-paper2 text-muted",
    red: "border-red/30 bg-red/8 text-red",
    yellow: "border-yellow2/60 bg-yellow text-ink",
    blue: "border-blue2/25 bg-blue text-blue2",
    green: "border-green/30 bg-green2 text-green",
    ink: "border-ink bg-ink text-paper",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] ${tonos[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: number }) {
  const t = TIER_ETIQUETA[tier] || TIER_ETIQUETA[3];
  return <span className={`inline-flex rounded-[2px] border px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.1em] ${t.clase}`}>{t.texto}</span>;
}

export function StatusDot({ estado, className = "" }: { estado: string; className?: string }) {
  const color = estado === "ok" ? "bg-green" : estado === "error" ? "bg-red" : "bg-line2";
  return (
    <span className={`relative inline-flex h-2 w-2 shrink-0 ${className}`}>
      {estado === "ok" && <span className="absolute inset-0 rounded-full bg-green/40 pulso" />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

export function AnimatedNumber({
  value,
  formato,
  className = "",
  duracion = 900,
}: {
  value: number | null | undefined;
  formato: string;
  className?: string;
  duracion?: number;
}) {
  const reducido = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    if (value === null || value === undefined) return;
    if (reducido) { setDisplay(value); anterior.current = value; return; }
    const desde = anterior.current;
    const inicio = performance.now();
    let raf = 0;
    const tick = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / duracion);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(desde + (value - desde) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else anterior.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duracion, reducido]);

  return <span className={`tabular-nums ${className}`}>{formatear(display, formato)}</span>;
}

export function StatCard({
  label,
  value,
  formato = "float",
  unit,
  date,
  source,
  serie,
  color = "#e4002b",
  href,
  big = false,
}: {
  label: string;
  value: number | null | undefined;
  formato?: string;
  unit?: string;
  date?: string;
  source?: string;
  serie?: { x: number | string; y: number }[] | null;
  color?: string;
  href?: string;
  big?: boolean;
}) {
  const contenido = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="kicker">{label}</div>
        {href && <ArrowUpRight size={14} className="shrink-0 text-muted transition-colors group-hover:text-red" />}
      </div>
      <div className={`mt-3 font-display font-extrabold leading-none tracking-[-0.04em] text-ink ${big ? "text-[clamp(2rem,4vw,3.2rem)]" : "text-[clamp(1.5rem,2.5vw,2.2rem)]"}`}>
        {typeof value === "number" ? <AnimatedNumber value={value} formato={formato} /> : "—"}
      </div>
      {unit && <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{unit}</div>}
      {serie && serie.length >= 3 && (
        <div className="mt-3 -ml-1 opacity-80">
          <Sparkline serie={serie} color={color} width={240} height={46} />
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted">
        <span className="truncate">{source || "SARCOL"}</span>
        <span className="shrink-0">{date || ""}</span>
      </div>
    </>
  );
  const clase = "group flex h-full flex-col rounded-[2px] border border-line bg-paper2 p-5 shadow-[4px_4px_0_0_rgba(20,21,24,0.05)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-line2 hover:shadow-[7px_7px_0_0_rgba(20,21,24,0.09)]";
  if (href) return <Link to={href} className={clase}>{contenido}</Link>;
  return <div className={clase}>{contenido}</div>;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-line2 bg-paper2/60 px-6 py-14 text-center">
      <div className="mb-3 text-muted">{icon || <Inbox size={24} />}</div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-[2px] ${className}`} />;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 18,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reducido = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducido ? false : { opacity: 0, y }}
      whileInView={reducido ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SourceLink({ nombre, url }: { nombre: string; url: string }) {
  if (!url || url === "#") return <span className="text-muted">{nombre}</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted transition-colors hover:text-red">
      {nombre} <ExternalLink size={10} />
    </a>
  );
}

export function Rule({ strong = false }: { strong?: boolean }) {
  return <div className={strong ? "rule-strong" : "rule"} />;
}
