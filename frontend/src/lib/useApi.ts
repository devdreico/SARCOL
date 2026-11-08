import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "./api";

/** Hook mínimo de fetch con estados de carga, error y recarga. */
export function useApi<T>(ruta: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(!!ruta);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cargar = useCallback(async (silencioso = false) => {
    if (!ruta) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    if (!silencioso) setCargando(true);
    setError(null);
    try {
      const d = await apiGet<T>(ruta, ctrl.signal);
      if (!ctrl.signal.aborted) setData(d);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Error de conexión");
      }
    } finally {
      if (!ctrl.signal.aborted) setCargando(false);
    }
  }, [ruta]);

  useEffect(() => {
    cargar();
    return () => abortRef.current?.abort();
  }, [cargar]);

  return { data, cargando, error, refetch: cargar };
}
