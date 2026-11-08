/** Tipos compartidos de la API de SARCOL. */

export type Indicador = {
  key: string;
  nombre: string;
  categoria: string;
  unidad: string;
  formato: string;
  descripcion_simple: string;
  descripcion_tecnica: string;
  fuente_key: string;
  fuente_nombre: string;
  fuente_url: string;
  fuente_tier: number;
  valor: number | null;
  fecha_valor: string;
  serie: { x: number | string; y: number }[] | null;
  comparativas: { pais: string; iso?: string; valor: number; anio?: string }[] | null;
  nota: string;
  actualizado_en: string;
};

export type Arbol = {
  categorias: { id: string; nombre: string; indicadores: Indicador[] }[];
  total: number;
  actualizado_en: string | null;
};

export type Fuente = {
  key: string;
  nombre: string;
  url: string;
  tier: number;
  tipo: "en vivo" | "contexto" | string;
  frecuencia: string;
  cobertura: string;
  descripcion: string;
  estado: "ok" | "error" | "sin-ejecucion" | string;
  detalle: string;
  ultima_ejecucion: string | null;
  duracion_ms: number;
  registros: number;
};

export type Actividad = {
  fuente: string;
  estado: string;
  detalle: string;
  ultima_ejecucion: string;
  duracion_ms: number;
  registros: number;
};

export type Pulso = {
  items: Pick<Indicador, "key" | "nombre" | "valor" | "formato" | "unidad" | "fecha_valor" | "fuente_nombre" | "serie">[];
  fuentes: Fuente[];
  actividad: Actividad[];
  conteos: {
    indicadores: number;
    historia: number;
    problematicas: number;
    departamentos: number;
    votos: number;
  };
  actualizado_en: string | null;
  proxima_ejecucion: string | null;
  estado: string;
};

export type PanelData = {
  kpis: Pick<Indicador, "key" | "nombre" | "categoria" | "unidad" | "formato" | "valor" | "fecha_valor" | "serie" | "fuente_nombre" | "fuente_key" | "fuente_tier" | "actualizado_en">[];
  categorias: { id: string; nombre: string; total: number; con_dato: number }[];
  fuentes: Fuente[];
  actividad: Actividad[];
  decisiones: { slug: string; titulo: string; nivel: string; ambito: string; fecha_decision: string }[];
  mapa: {
    top: { departamento: string; procesos: number; valor_referencial: number }[];
    total_procesos: number;
    total_valor: number;
  };
  conteos: {
    indicadores: number;
    indicadores_con_dato: number;
    historia: number;
    problematicas: number;
    soluciones: number;
    departamentos: number;
    votos: number;
  };
  actualizado_en: string | null;
};

export type EventoHistoria = {
  slug: string;
  era: string;
  anio: number;
  fecha_str: string;
  titulo: string;
  categoria: string;
  administracion: string;
  responsables: string;
  impacto: string;
  descripcion_simple: string;
  descripcion_tecnica: string;
  fuentes: { nombre: string; url: string }[] | null;
  verificacion: string;
};

export type Era = {
  id: string;
  nombre: string;
  rango: string;
  rigor: string;
  descripcion: string;
  eventos: EventoHistoria[];
};

export type ProblematicaResumen = {
  slug: string;
  titulo: string;
  nivel: string;
  ambito: string;
  categoria: string;
  es_decision_activa: boolean;
  fecha_decision: string;
  resumen_simple: string;
  votos_serias: number;
  votos_buena: number;
  votos_total: number;
};

export type ProblematicaDetalle = ProblematicaResumen & {
  analisis_tecnico: string;
  solucion_analisis: string;
  solucion_propuesta: string;
  fuentes: { nombre: string; url: string }[] | null;
  votos_acuerdo: number;
  votos_desacuerdo: number;
};

export type Solucion = ProblematicaDetalle;

export type Dpto = {
  departamento: string;
  procesos: number;
  valor_referencial: number;
};

export type MapaDatos = {
  departamentos: Dpto[];
  total_procesos: number;
  total_valor: number;
  nota: string;
};

export type BusquedaItem = {
  id: string;
  titulo: string;
  subtitulo: string;
  ruta: string;
  badge: string;
  tipo: string;
};

export type BusquedaGrupo = {
  tipo: string;
  etiqueta: string;
  items: BusquedaItem[];
};

export type Busqueda = {
  query: string;
  grupos: BusquedaGrupo[];
  total: number;
};
