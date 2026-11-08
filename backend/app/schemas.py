"""Esquemas de respuesta de la API."""
from pydantic import BaseModel


class IndicadorOut(BaseModel):
    key: str
    nombre: str
    categoria: str
    unidad: str
    formato: str
    descripcion_simple: str
    descripcion_tecnica: str
    fuente_key: str
    fuente_nombre: str
    fuente_url: str
    fuente_tier: int
    valor: float | None
    fecha_valor: str
    serie: list | None
    comparativas: list | None
    nota: str
    actualizado_en: str


class IndicadorMatriz(BaseModel):
    """Fila de la tabla de comparación internacional."""
    nombre: str
    unidad: str
    formato: str
    valores: list  # [{pais, valor}]


class FuenteLogOut(BaseModel):
    fuente: str
    estado: str
    detalle: str
    ultima_ejecucion: str


class MetaOut(BaseModel):
    ultima_actualizacion: str | None
    fuentes: list[FuenteLogOut]
    proxima_ejecucion: str | None


class EventoOut(BaseModel):
    slug: str
    era: str
    anio: int
    fecha_str: str
    titulo: str
    categoria: str
    administracion: str
    responsables: str
    impacto: str
    descripcion_simple: str
    descripcion_tecnica: str
    fuentes: list | None
    verificacion: str


class EraOut(BaseModel):
    id: str
    nombre: str
    rango: str
    rigor: str
    descripcion: str
    eventos: list[EventoOut]


class VotosResumen(BaseModel):
    entidad: str
    entidad_id: str
    seria: int = 0
    buena: int = 0
    acuerdo: int = 0
    desacuerdo: int = 0
    total: int = 0
    voto_previo: str | None = None


class VotoIn(BaseModel):
    entidad: str
    entidad_id: str
    opcion: str
    huella: str


class VotoOut(BaseModel):
    aceptado: bool
    mensaje: str
    resumen: VotosResumen


class SecopDptoOut(BaseModel):
    departamento: str
    procesos: int
    valor_referencial: float


class ProblematicaResumen(BaseModel):
    slug: str
    titulo: str
    nivel: str
    ambito: str
    categoria: str
    es_decision_activa: bool
    fecha_decision: str
    resumen_simple: str
    votos_serias: int
    votos_buena: int
    votos_total: int


class ProblematicaDetalle(ProblematicaResumen):
    analisis_tecnico: str
    solucion_analisis: str
    solucion_propuesta: str
    fuentes: list | None
    votos_acuerdo: int
    votos_desacuerdo: int
