/** Formato de números y fechas según el tipo de indicador. */

export type Formato = "int" | "float" | "float1" | "float2" | "pct" | "money" | "pesos2" | "billones";

export function formatear(valor: number | null | undefined, formato: string): string {
  if (valor === null || valor === undefined) return "—";
  switch (formato) {
    case "int":
      return Math.round(valor).toLocaleString("es-CO");
    case "float":
      return valor.toLocaleString("es-CO", { maximumFractionDigits: 2 });
    case "float1":
      return valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    case "float2":
      return valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "pct":
      return `${valor.toLocaleString("es-CO", { maximumFractionDigits: 2 })}%`;
    case "money":
      if (Math.abs(valor) >= 1e12) return `${(valor / 1e12).toLocaleString("es-CO", { maximumFractionDigits: 1 })} billones USD`;
      if (Math.abs(valor) >= 1e9) return `${(valor / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil millones USD`;
      if (Math.abs(valor) >= 1e6) return `${(valor / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 })} millones USD`;
      return `${Math.round(valor).toLocaleString("es-CO")} USD`;
    case "billones":
      return `${(valor / 1e12).toLocaleString("es-CO", { maximumFractionDigits: 1 })} billones`;
    case "pesos2":
      return `$${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return valor.toLocaleString("es-CO");
  }
}

export function fechaLegible(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

export function fechaCorta(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function fechaHora(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function haceCuanto(iso: string | null): string {
  if (!iso) return "sin registro";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const segundos = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (segundos < 60) return "hace instantes";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias} d`;
  return fechaCorta(iso);
}

export function titleCase(s: string): string {
  const f = (s || "").toLowerCase();
  return f.replace(/(^|\s)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

export function normalizar(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export const TIER_ETIQUETA: Record<number, { texto: string; clase: string; corto: string }> = {
  1: { texto: "TIER 1 · ESTATAL", corto: "T1", clase: "bg-yellow text-ink border-ink/15" },
  2: { texto: "TIER 2 · INSTITUCIONAL", corto: "T2", clase: "bg-blue text-blue2 border-blue2/25" },
  3: { texto: "TIER 3 · VERIFICADO", corto: "T3", clase: "bg-red/10 text-red border-red/30" },
};

export function duracion(ms: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} s`;
}
