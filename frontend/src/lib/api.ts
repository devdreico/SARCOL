/** Cliente API de SARCOL + huella de dispositivo anónima. */

const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const API = apiOrigin ? `${apiOrigin}/api` : "/api";

export async function apiGet<T>(ruta: string, signal?: AbortSignal): Promise<T> {
  const r = await fetch(`${API}${ruta}`, { signal, cache: "no-store" });
  if (!r.ok) throw new Error(`API ${ruta}: ${r.status}`);
  return r.json() as Promise<T>;
}

export async function apiPost<T>(ruta: string, body: unknown): Promise<T> {
  const r = await fetch(`${API}${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await r.json()) as T & { detail?: string };
  if (!r.ok) throw new Error(json.detail || `API ${ruta}: ${r.status}`);
  return json as T;
}

export function apiUrl(ruta: string): string {
  return `${API}${ruta}`;
}

/** Huella de dispositivo: se compone de rasgos no identificativos y se hashea
 *  con SHA-256. El servidor solo recibe el hash; no permite identificar a nadie.
 *  Su único uso: impedir 2 votos del mismo dispositivo en el mismo debate. */
export async function huellaDispositivo(): Promise<string> {
  const componentes = [
    navigator.userAgent,
    navigator.language,
    String(navigator.hardwareConcurrency || 0),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    "SARCOL-HUELLA-V1",
  ].join("|");
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(componentes));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // Contexto no seguro (http): hash fallback simple, suficientemente único por dispositivo
    let h = 5381;
    for (let i = 0; i < componentes.length; i++) {
      h = ((h << 5) + h + componentes.charCodeAt(i)) >>> 0;
    }
    return `f${h.toString(16)}${componentes.length.toString(16)}`.padEnd(24, "0");
  }
}
