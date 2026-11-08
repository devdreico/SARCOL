"""API de HISTORIA: tres eras con rigor escalonado, administración responsable y fuentes."""
from fastapi import APIRouter
from sqlalchemy import select

from ..db import SesionLocal
from ..models import EventoHistorico
from ..schemas import EraOut, EventoOut
from ..data.historia_seed import ERAS

router = APIRouter(prefix="/api/historia", tags=["historia"])


def _evento_out(e: EventoHistorico) -> EventoOut:
    return EventoOut(
        slug=e.slug, era=e.era, anio=e.anio, fecha_str=e.fecha_str, titulo=e.titulo,
        categoria=e.categoria, administracion=e.administracion, responsables=e.responsables,
        impacto=e.impacto, descripcion_simple=e.descripcion_simple,
        descripcion_tecnica=e.descripcion_tecnica, fuentes=e.fuentes, verificacion=e.verificacion,
    )


@router.get("")
def historia():
    with SesionLocal() as sesion:
        rows = sesion.execute(select(EventoHistorico).order_by(EventoHistorico.orden)).scalars().all()
    eras = []
    for era in ERAS:
        eventos = [_evento_out(e) for e in rows if e.era == era["id"]]
        eras.append(EraOut(
            id=era["id"], nombre=era["nombre"], rango=era["rango"], rigor=era["rigor"],
            descripcion=era["descripcion"], eventos=eventos,
        ).model_dump())
    total = len(rows)
    return {"eras": eras, "total_eventos": total}
