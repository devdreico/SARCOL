"""Modelos de base de datos de SARCOL."""
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Indicador(Base):
    """Un dato del país: valor actual + serie + comparativas + doble explicación."""
    __tablename__ = "indicadores"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))
    categoria: Mapped[str] = mapped_column(String(60), index=True)
    unidad: Mapped[str] = mapped_column(String(40), default="")
    formato: Mapped[str] = mapped_column(String(20), default="float")  # int|float|pct|money|pesos|usd
    descripcion_simple: Mapped[str] = mapped_column(Text, default="")
    descripcion_tecnica: Mapped[str] = mapped_column(Text, default="")
    fuente_key: Mapped[str] = mapped_column(String(40), default="dane")
    fuente_nombre: Mapped[str] = mapped_column(String(200), default="")
    fuente_url: Mapped[str] = mapped_column(String(400), default="")
    fuente_tier: Mapped[int] = mapped_column(Integer, default=3)
    valor: Mapped[float | None] = mapped_column(Float, nullable=True)
    fecha_valor: Mapped[str] = mapped_column(String(40), default="")
    serie: Mapped[list | None] = mapped_column(JSON, nullable=True)            # [{x: año, y: valor}]
    comparativas: Mapped[list | None] = mapped_column(JSON, nullable=True)     # [{pais, valor}]
    nota: Mapped[str] = mapped_column(Text, default="")
    actualizado_en: Mapped[datetime] = mapped_column(DateTime, default=ahora, onupdate=ahora)


class SecopDepartamento(Base):
    """Contratación pública (SECOP II) agregada por departamento de la entidad."""
    __tablename__ = "secop_departamento"

    departamento: Mapped[str] = mapped_column(String(80), primary_key=True)   # nombre canónico del mapa
    procesos: Mapped[int] = mapped_column(Integer, default=0)
    valor_referencial: Mapped[float] = mapped_column(Float, default=0.0)      # suma precio_base (COP)
    actualizado_en: Mapped[datetime] = mapped_column(DateTime, default=ahora, onupdate=ahora)


class EventoHistorico(Base):
    """Un suceso histórico con doble explicación, administración responsable y fuentes."""
    __tablename__ = "historia"

    slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    era: Mapped[str] = mapped_column(String(20), index=True)                  # 1810-1900 | 1900-1991 | 1991-hoy
    anio: Mapped[int] = mapped_column(Integer, index=True)
    fecha_str: Mapped[str] = mapped_column(String(60), default="")
    titulo: Mapped[str] = mapped_column(String(250))
    categoria: Mapped[str] = mapped_column(String(40), default="POLÍTICA")
    administracion: Mapped[str] = mapped_column(String(120), default="")
    responsables: Mapped[str] = mapped_column(String(250), default="")
    impacto: Mapped[str] = mapped_column(String(20), default="estructural")   # positivo|negativo|mixto|estructural
    descripcion_simple: Mapped[str] = mapped_column(Text, default="")
    descripcion_tecnica: Mapped[str] = mapped_column(Text, default="")
    fuentes: Mapped[list | None] = mapped_column(JSON, nullable=True)         # [{nombre, url}]
    verificacion: Mapped[str] = mapped_column(String(40), default="verificado")  # verificado|pendiente-manual
    orden: Mapped[float] = mapped_column(Float, default=0.0)


class Problematica(Base):
    """Una problemática del país (pirámide nacional → departamental → municipal) con su solución."""
    __tablename__ = "problematicas"

    slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    titulo: Mapped[str] = mapped_column(String(250))
    nivel: Mapped[str] = mapped_column(String(20), index=True)                # nacional|departamental|municipal
    ambito: Mapped[str] = mapped_column(String(80), default="Colombia")
    categoria: Mapped[str] = mapped_column(String(40), default="SOCIAL")
    es_decision_activa: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_decision: Mapped[str] = mapped_column(String(60), default="")
    resumen_simple: Mapped[str] = mapped_column(Text, default="")
    analisis_tecnico: Mapped[str] = mapped_column(Text, default="")
    solucion_analisis: Mapped[str] = mapped_column(Text, default="")
    solucion_propuesta: Mapped[str] = mapped_column(Text, default="")
    fuentes: Mapped[list | None] = mapped_column(JSON, nullable=True)
    orden: Mapped[float] = mapped_column(Float, default=0.0)


class Voto(Base):
    """Voto incorruptible: 1 por dispositivo (huella hasheada) por entidad/debate."""
    __tablename__ = "votos"
    __table_args__ = (UniqueConstraint("entidad", "entidad_id", "huella", name="uq_voto_huella"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entidad: Mapped[str] = mapped_column(String(30), index=True)              # problematica|solucion
    entidad_id: Mapped[str] = mapped_column(String(80), index=True)
    opcion: Mapped[str] = mapped_column(String(30))
    huella: Mapped[str] = mapped_column(String(64), index=True)
    ip_hash: Mapped[str] = mapped_column(String(64), default="")
    creado: Mapped[datetime] = mapped_column(DateTime, default=ahora)


class FuenteLog(Base):
    """Bitácora del sistema de verificación diaria."""
    __tablename__ = "fuentes_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fuente: Mapped[str] = mapped_column(String(40), index=True)
    estado: Mapped[str] = mapped_column(String(10), default="ok")             # ok|error
    detalle: Mapped[str] = mapped_column(Text, default="")
    duracion_ms: Mapped[int] = mapped_column(Integer, default=0)
    registros: Mapped[int] = mapped_column(Integer, default=0)
    ultima_ejecucion: Mapped[datetime] = mapped_column(DateTime, default=ahora)
