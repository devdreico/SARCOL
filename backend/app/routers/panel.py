"""API del PANEL: una sola llamada para la sala de situación de SARCOL."""
from fastapi import APIRouter
from sqlalchemy import select

from ..config import FUENTES
from ..db import SesionLocal
from ..models import (
    EventoHistorico, FuenteLog, Indicador, Problematica, SecopDepartamento, Voto,
)
from ..data.indicadores_def import CATEGORIAS

router = APIRouter(prefix="/api/panel", tags=["panel"])

KPIS = ["trm", "poblacion_total", "desempleo", "pib_crecimiento", "secop_procesos", "secop_valor"]


def _ind_out(i: Indicador) -> dict:
    return {
        "key": i.key, "nombre": i.nombre, "categoria": i.categoria,
        "unidad": i.unidad, "formato": i.formato,
        "valor": i.valor, "fecha_valor": i.fecha_valor,
        "serie": i.serie, "fuente_nombre": i.fuente_nombre,
        "fuente_key": i.fuente_key, "fuente_tier": i.fuente_tier,
        "actualizado_en": i.actualizado_en.isoformat() if i.actualizado_en else "",
    }


def _ultimos_logs(sesion) -> dict[str, FuenteLog]:
    rows = sesion.execute(
        select(FuenteLog).order_by(FuenteLog.ultima_ejecucion.desc())
    ).scalars().all()
    ultimos: dict[str, FuenteLog] = {}
    for r in rows:
        if r.fuente not in ultimos:
            ultimos[r.fuente] = r
    return ultimos


def _fuentes(sesion) -> list[dict]:
    ultimos = _ultimos_logs(sesion)
    salida = []
    for key, meta in FUENTES.items():
        log = ultimos.get(meta.get("log_name", ""))
        salida.append({
            "key": key,
            "nombre": meta["nombre"],
            "url": meta["url"],
            "tier": meta["tier"],
            "tipo": meta.get("tipo", "contexto"),
            "frecuencia": meta.get("frecuencia", ""),
            "cobertura": meta.get("cobertura", ""),
            "descripcion": meta.get("descripcion", ""),
            "estado": log.estado if log else "sin-ejecucion",
            "detalle": log.detalle if log else "",
            "ultima_ejecucion": log.ultima_ejecucion.isoformat() if log else None,
            "duracion_ms": log.duracion_ms if log else 0,
            "registros": log.registros if log else 0,
        })
    return salida


@router.get("")
def panel():
    """Resumen agregado: KPIs, categorías, fuentes, actividad, decisiones y mapa."""
    with SesionLocal() as sesion:
        indicadores = sesion.execute(select(Indicador)).scalars().all()
        por_key = {i.key: i for i in indicadores}

        kpis = [_ind_out(por_key[k]) for k in KPIS if k in por_key]

        categorias = []
        for cat in CATEGORIAS:
            inds = [i for i in indicadores if i.categoria == cat]
            categorias.append({
                "id": cat, "nombre": cat, "total": len(inds),
                "con_dato": sum(1 for i in inds if i.valor is not None),
            })

        fuentes = _fuentes(sesion)

        logs = sesion.execute(
            select(FuenteLog).order_by(FuenteLog.ultima_ejecucion.desc()).limit(12)
        ).scalars().all()
        actividad = [{
            "fuente": l.fuente, "estado": l.estado, "detalle": l.detalle,
            "ultima_ejecucion": l.ultima_ejecucion.isoformat(),
            "duracion_ms": l.duracion_ms, "registros": l.registros,
        } for l in logs]

        decisiones = sesion.execute(
            select(Problematica).where(Problematica.es_decision_activa.is_(True))
            .order_by(Problematica.orden)
        ).scalars().all()

        departamentos = sesion.execute(
            select(SecopDepartamento).order_by(SecopDepartamento.procesos.desc()).limit(8)
        ).scalars().all()

        total_procesos = sum(d.procesos for d in departamentos)
        total_valor = sum(d.valor_referencial for d in departamentos)

        conteos = {
            "indicadores": len(indicadores),
            "indicadores_con_dato": sum(1 for i in indicadores if i.valor is not None),
            "historia": sesion.query(EventoHistorico).count(),
            "problematicas": sesion.query(Problematica).count(),
            "soluciones": sesion.query(Problematica).filter(Problematica.solucion_analisis != "").count(),
            "departamentos": sesion.query(SecopDepartamento).count(),
            "votos": sesion.query(Voto).count(),
        }

        actualizado = max((i.actualizado_en for i in indicadores if i.actualizado_en), default=None)

    return {
        "kpis": kpis,
        "categorias": categorias,
        "fuentes": fuentes,
        "actividad": actividad,
        "decisiones": [{
            "slug": p.slug, "titulo": p.titulo, "nivel": p.nivel,
            "ambito": p.ambito, "fecha_decision": p.fecha_decision,
        } for p in decisiones],
        "mapa": {
            "top": [{
                "departamento": d.departamento, "procesos": d.procesos,
                "valor_referencial": d.valor_referencial,
            } for d in departamentos],
            "total_procesos": total_procesos,
            "total_valor": total_valor,
        },
        "conteos": conteos,
        "actualizado_en": actualizado.isoformat() if actualizado else None,
    }
