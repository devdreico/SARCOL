"""Descargas abiertas de SARCOL en CSV (UTF-8 con BOM para Excel)."""
import csv
import io

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from sqlalchemy import select

from ..db import SesionLocal
from ..models import EventoHistorico, Indicador, Problematica, SecopDepartamento

router = APIRouter(prefix="/api/export", tags=["export"])


def _csv(nombre: str, encabezados: list[str], filas: list[list]) -> Response:
    buffer = io.StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer, delimiter=";", lineterminator="\n")
    writer.writerow(encabezados)
    writer.writerows(filas)
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="sarcol-{nombre}.csv"'},
    )


@router.get("")
def indice():
    return {
        "datasets": [
            {"id": "indicadores", "nombre": "Indicadores", "ruta": "/api/export/indicadores.csv"},
            {"id": "historia", "nombre": "Historia", "ruta": "/api/export/historia.csv"},
            {"id": "problematicas", "nombre": "Problemáticas y soluciones", "ruta": "/api/export/problematicas.csv"},
            {"id": "mapa", "nombre": "Contratación por departamento", "ruta": "/api/export/mapa.csv"},
        ]
    }


@router.get("/indicadores.csv")
def exportar_indicadores():
    with SesionLocal() as sesion:
        rows = sesion.execute(select(Indicador).order_by(Indicador.categoria, Indicador.nombre)).scalars().all()
    return _csv(
        "indicadores",
        ["key", "nombre", "categoria", "unidad", "formato", "valor", "fecha_valor",
         "fuente_nombre", "fuente_tier", "actualizado_en"],
        [[r.key, r.nombre, r.categoria, r.unidad, r.formato, r.valor, r.fecha_valor,
          r.fuente_nombre, r.fuente_tier,
          r.actualizado_en.isoformat() if r.actualizado_en else ""] for r in rows],
    )


@router.get("/historia.csv")
def exportar_historia():
    with SesionLocal() as sesion:
        rows = sesion.execute(select(EventoHistorico).order_by(EventoHistorico.orden)).scalars().all()
    return _csv(
        "historia",
        ["slug", "era", "anio", "fecha_str", "titulo", "categoria", "administracion",
         "responsables", "impacto", "verificacion"],
        [[r.slug, r.era, r.anio, r.fecha_str, r.titulo, r.categoria, r.administracion,
          r.responsables, r.impacto, r.verificacion] for r in rows],
    )


@router.get("/problematicas.csv")
def exportar_problematicas():
    with SesionLocal() as sesion:
        rows = sesion.execute(select(Problematica).order_by(Problematica.orden)).scalars().all()
    return _csv(
        "problematicas",
        ["slug", "titulo", "nivel", "ambito", "categoria", "decision_activa",
         "fecha_decision", "resumen_simple", "analisis_tecnico", "solucion_analisis", "solucion_propuesta"],
        [[r.slug, r.titulo, r.nivel, r.ambito, r.categoria, r.es_decision_activa,
          r.fecha_decision, r.resumen_simple, r.analisis_tecnico, r.solucion_analisis,
          r.solucion_propuesta] for r in rows],
    )


@router.get("/mapa.csv")
def exportar_mapa():
    with SesionLocal() as sesion:
        rows = sesion.execute(
            select(SecopDepartamento).order_by(SecopDepartamento.procesos.desc())
        ).scalars().all()
    return _csv(
        "mapa",
        ["departamento", "procesos", "valor_referencial", "actualizado_en"],
        [[r.departamento, r.procesos, r.valor_referencial,
          r.actualizado_en.isoformat() if r.actualizado_en else ""] for r in rows],
    )
