# API de SOLUCIONES: análisis imparcial por problemática, con el voto como única interacción.
from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from ..db import SesionLocal
from ..models import Problematica, Voto
from ..schemas import ProblematicaDetalle

router = APIRouter(prefix="/api/soluciones", tags=["soluciones"])


@router.get("")
def listar():
    """Todas las soluciones: análisis imparcial + propuesta + votos (acuerdo/desacuerdo)."""
    with SesionLocal() as sesion:
        rows = sesion.execute(select(Problematica).order_by(Problematica.orden)).scalars().all()
        soluciones = []
        for p in rows:
            if not p.solucion_analisis:
                continue
            seria = buena = acuerdo = desacuerdo = 0
            votos = sesion.execute(
                select(Voto.entidad, Voto.opcion).where(Voto.entidad_id == p.slug)
            ).all()
            for entidad, opcion in votos:
                if opcion == "seria":
                    seria += 1
                elif opcion == "buena":
                    buena += 1
                elif opcion == "acuerdo":
                    acuerdo += 1
                elif opcion == "desacuerdo":
                    desacuerdo += 1
            soluciones.append(ProblematicaDetalle(
                slug=p.slug, titulo=p.titulo, nivel=p.nivel, ambito=p.ambito, categoria=p.categoria,
                es_decision_activa=p.es_decision_activa, fecha_decision=p.fecha_decision,
                resumen_simple=p.resumen_simple, analisis_tecnico=p.analisis_tecnico,
                solucion_analisis=p.solucion_analisis, solucion_propuesta=p.solucion_propuesta,
                fuentes=p.fuentes, votos_serias=seria, votos_buena=buena,
                votos_total=seria + buena, votos_acuerdo=acuerdo, votos_desacuerdo=desacuerdo,
            ).model_dump())
    return {"soluciones": soluciones}
