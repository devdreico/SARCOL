"""API de PROBLEMÁTICAS y SOLUCIONES: pirámide con recopilación de votos."""
from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from ..db import SesionLocal
from ..models import Problematica, Voto
from ..schemas import ProblematicaResumen, ProblematicaDetalle

router = APIRouter(prefix="/api/problematicas", tags=["problematicas"])


def _conteo(sesion, entidad_id: str) -> tuple[int, int, int, int]:
    rows = sesion.execute(
        select(Voto.opcion, Voto.entidad).where(Voto.entidad_id == entidad_id)
    ).all()
    seria = buena = acuerdo = desacuerdo = 0
    for opcion, entidad in rows:
        if entidad != "problematica" and entidad != "solucion":
            continue
        if opcion == "seria":
            seria += 1
        elif opcion == "buena":
            buena += 1
        elif opcion == "acuerdo":
            acuerdo += 1
        elif opcion == "desacuerdo":
            desacuerdo += 1
    return seria, buena, acuerdo, desacuerdo


def _resumen(sesion, p: Problematica) -> ProblematicaResumen:
    seria, buena, _, _ = _conteo(sesion, p.slug)
    return ProblematicaResumen(
        slug=p.slug, titulo=p.titulo, nivel=p.nivel, ambito=p.ambito, categoria=p.categoria,
        es_decision_activa=p.es_decision_activa, fecha_decision=p.fecha_decision,
        resumen_simple=p.resumen_simple,
        votos_serias=seria, votos_buena=buena, votos_total=seria + buena,
    )


@router.get("")
def listar():
    """Pirámide completa: nacional → departamental → municipal, con votos en vivo."""
    with SesionLocal() as sesion:
        rows = sesion.execute(select(Problematica).order_by(Problematica.orden)).scalars().all()
    piramide = {"nacional": [], "departamental": [], "municipal": []}
    for p in rows:
        piramide.setdefault(p.nivel, []).append(_resumen(sesion, p).model_dump())
    return piramide


@router.get("/{slug}")
def detalle(slug: str):
    with SesionLocal() as sesion:
        p = sesion.get(Problematica, slug)
        if not p:
            raise HTTPException(404, "problemática no encontrada")
        seria, buena, acuerdo, desacuerdo = _conteo(sesion, slug)
        return ProblematicaDetalle(
            slug=p.slug, titulo=p.titulo, nivel=p.nivel, ambito=p.ambito, categoria=p.categoria,
            es_decision_activa=p.es_decision_activa, fecha_decision=p.fecha_decision,
            resumen_simple=p.resumen_simple, analisis_tecnico=p.analisis_tecnico,
            solucion_analisis=p.solucion_analisis, solucion_propuesta=p.solucion_propuesta,
            fuentes=p.fuentes,
            votos_serias=seria, votos_buena=buena, votos_total=seria + buena,
            votos_acuerdo=acuerdo, votos_desacuerdo=desacuerdo,
        ).model_dump()
