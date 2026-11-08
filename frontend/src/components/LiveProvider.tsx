import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet } from "../lib/api";
import type { Pulso } from "../lib/types";

type LiveContextValue = {
  pulso: Pulso | null;
  cargando: boolean;
  conectado: boolean;
  refetch: () => Promise<void>;
};

const LiveContext = createContext<LiveContextValue | null>(null);

/** Un solo poll + SSE para toda la app. */
export function LiveProvider({ children }: { children: ReactNode }) {
  const [pulso, setPulso] = useState<Pulso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [conectado, setConectado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const p = await apiGet<Pulso>("/meta/pulso");
      setPulso(p);
    } catch {
      // La barra de sistema muestra el último dato disponible.
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = window.setInterval(cargar, 45_000);
    let fuente: EventSource | null = null;
    try {
      fuente = new EventSource("/api/meta/eventos");
      fuente.onopen = () => setConectado(true);
      fuente.onerror = () => setConectado(false);
      fuente.addEventListener("fuente", () => cargar());
      fuente.addEventListener("refresco", () => cargar());
    } catch {
      setConectado(false);
    }
    return () => {
      window.clearInterval(intervalo);
      fuente?.close();
    };
  }, [cargar]);

  return (
    <LiveContext.Provider value={{ pulso, cargando, conectado, refetch: cargar }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLive debe usarse dentro de LiveProvider");
  return ctx;
}
