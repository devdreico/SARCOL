"""API de COLOMBIA — ESTADO ACTUAL: árbol de indicadores, comparativas y refresco manual."""
from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import select

from ..db import SesionLocal
from ..models import Indicador, SecopDepartamento
from ..schemas import IndicadorOut, IndicadorMatriz
from ..data.indicadores_def import CATEGORIAS, INDICADORES

router = APIRouter(prefix="/api/estado", tags=["estado"])


def _a_out(ind: Indicador) -> IndicadorOut:
    return IndicadorOut(
        key=ind.key, nombre=ind.nombre, categoria=ind.categoria, unidad=ind.unidad,
        formato=ind.formato, descripcion_simple=ind.descripcion_simple,
        descripcion_tecnica=ind.descripcion_tecnica, fuente_key=ind.fuente_key,
        fuente_nombre=ind.fuente_nombre, fuente_url=ind.fuente_url, fuente_tier=ind.fuente_tier,
        valor=ind.valor, fecha_valor=ind.fecha_valor, serie=ind.serie,
        comparativas=ind.comparativas, nota=ind.nota or "",
        actualizado_en=ind.actualizado_en.isoformat() if ind.actualizado_en else "",
    )


@router.get("/arbol")
def arbol():
    """Árbol completo del estado actual: categorías → indicadores con doble explicación."""
    with SesionLocal() as sesion:
        rows = sesion.execute(select(Indicador).order_by(Indicador.key)).scalars().all()
    por_key = {r.key: r for r in rows}
    arbol = []
    for cat in CATEGORIAS:
        inds = [_a_out(por_key[d["key"]]) for d in INDICADORES if d["categoria"] == cat and d["key"] in por_key]
        arbol.append({"id": cat, "nombre": cat, "indicadores": inds})
    return {"categorias": arbol, "total": len(por_key),
            "actualizado_en": max((r.actualizado_en for r in rows), default=None).__str__() if rows else None}


@router.get("/indicador/{key}")
def indicador(key: str):
    with SesionLocal() as sesion:
        ind = sesion.get(Indicador, key)
    if not ind:
        return {"error": "indicador no encontrado"}
    return _a_out(ind)


@router.get("/comparativa")
def comparativa():
    """Tabla de comparación internacional: indicador × país (solo Banco Mundial)."""
    with SesionLocal() as sesion:
        rows = sesion.execute(select(Indicador)).scalars().all()
    matriz = []
    for ind in rows:
        if not ind.comparativas:
            continue
        matriz.append(IndicadorMatriz(
            nombre=ind.nombre, unidad=ind.unidad, formato=ind.formato,
            valores=[{"pais": c["pais"], "iso": c.get("iso"), "valor": c["valor"], "anio": c.get("anio")} for c in ind.comparativas],
        ).model_dump())
    return {"indicadores": matriz}


@router.get("/comparativa-interna")
def comparativa_interna():
    """Comparación interna: contratación pública por departamento (SECOP II, vivo)."""
    with SesionLocal() as sesion:
        rows = sesion.execute(select(SecopDepartamento).order_by(SecopDepartamento.procesos.desc())).all()
    return {"departamentos": [
        {"departamento": r.departamento, "procesos": r.procesos,
         "valor_referencial": r.valor_referencial,
         "actualizado_en": r.actualizado_en.isoformat() if r.actualizado_en else ""}
        for r in rows
    ]}
