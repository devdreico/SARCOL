"""API de VOTOS: recopilación incorruptible.

Reglas SARCOL:
  · Un voto por dispositivo (huella hasheada) por cada problemática / solución.
  · Sin centro: solo dos opciones, siempre.
  · Anónimo: sin cuenta, sin contacto. La huella no permite identificar a nadie.
  · Si los votos quedan parejos, se MUESTRA la similitud (imparcialidad).
"""
from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select

from ..db import SesionLocal
from ..models import Problematica, Voto, ahora
from ..schemas import VotoIn, VotoOut, VotosResumen
from ..util import hash_ip

router = APIRouter(prefix="/api/votos", tags=["votos"])

OPCIONES_VALIDAS = {
    "problematica": {"seria", "buena"},
    "solucion": {"acuerdo", "desacuerdo"},
}


def _resumen(sesion, entidad: str, entidad_id: str, huella: str | None = None) -> VotosResumen:
    rows = sesion.execute(
        select(Voto).where(Voto.entidad == entidad, Voto.entidad_id == entidad_id)
    ).scalars().all()
    seria = buena = acuerdo = desacuerdo = 0
    voto_previo = None
    for v in rows:
        if v.opcion == "seria":
            seria += 1
        elif v.opcion == "buena":
            buena += 1
        elif v.opcion == "acuerdo":
            acuerdo += 1
        elif v.opcion == "desacuerdo":
            desacuerdo += 1
        if huella and v.huella == huella:
            voto_previo = v.opcion
    return VotosResumen(
        entidad=entidad, entidad_id=entidad_id, seria=seria, buena=buena,
        acuerdo=acuerdo, desacuerdo=desacuerdo,
        total=seria + buena + acuerdo + desacuerdo, voto_previo=voto_previo,
    )


@router.get("/resultado")
def resultado(entidad: str, entidad_id: str, huella: str | None = None):
    """Resultados en vivo + saber si este dispositivo ya votó."""
    with SesionLocal() as sesion:
        return _resumen(sesion, entidad, entidad_id, huella)


@router.post("")
def votar(voto: VotoIn, request: Request):
    if voto.entidad not in OPCIONES_VALIDAS:
        raise HTTPException(400, "entidad inválida")
    if voto.opcion not in OPCIONES_VALIDAS[voto.entidad]:
        raise HTTPException(400, "opción inválida para esta entidad")
    if len(voto.huella) < 8 or len(voto.huella) > 64:
        raise HTTPException(400, "huella inválida")

    # El debate debe existir (problemática registrada en SARCOL)
    if voto.entidad in ("problematica", "solucion"):
        with SesionLocal() as sesion:
            p = sesion.get(Problematica, voto.entidad_id)
        if not p:
            raise HTTPException(404, "debate no encontrado")

    ip_hash = hash_ip(request.client.host if request.client else None)
    with SesionLocal() as sesion:
        previo = sesion.execute(
            select(Voto).where(
                Voto.entidad == voto.entidad, Voto.entidad_id == voto.entidad_id,
                Voto.huella == voto.huella,
            )
        ).scalar_one_or_none()
        if previo:
            return VotoOut(
                aceptado=False, mensaje="Este dispositivo ya votó en este debate. El voto es incorruptible.",
                resumen=_resumen(sesion, voto.entidad, voto.entidad_id, voto.huella),
            )
        sesion.add(Voto(
            entidad=voto.entidad, entidad_id=voto.entidad_id, opcion=voto.opcion,
            huella=voto.huella, ip_hash=ip_hash, creado=ahora(),
        ))
        sesion.commit()
        return VotoOut(
            aceptado=True, mensaje="Voto registrado. Gracias por participar del debate.",
            resumen=_resumen(sesion, voto.entidad, voto.entidad_id, voto.huella),
        )
