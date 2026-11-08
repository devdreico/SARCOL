"""API META: estado de fuentes, pulso en vivo, bitácora, SSE y refresco manual."""
import asyncio
import json
import threading

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from ..config import FUENTES
from ..db import SesionLocal
from ..models import EventoHistorico, FuenteLog, Indicador, Problematica, SecopDepartamento, Voto
from ..scheduler import proxima_ejecucion
from ..ingesta.refresco import refrescar_sync
from .. import eventos
from .panel import _fuentes

router = APIRouter(prefix="/api/meta", tags=["meta"])

PULSO_KEYS = ["trm", "poblacion_total", "desempleo", "pib_crecimiento", "secop_procesos", "inflacion"]


def _ultima_actualizacion(sesion) -> str | None:
    row = sesion.execute(
        select(FuenteLog).order_by(FuenteLog.ultima_ejecucion.desc()).limit(1)
    ).scalar_one_or_none()
    return row.ultima_ejecucion.isoformat() if row else None


@router.get("")
def meta():
    with SesionLocal() as sesion:
        fuentes = _fuentes(sesion)
        ultima = max((f["ultima_ejecucion"] for f in fuentes if f["ultima_ejecucion"]), default=None)
    return {
        "ultima_actualizacion": ultima,
        "fuentes": fuentes,
        "proxima_ejecucion": proxima_ejecucion(),
    }


@router.get("/pulso")
def pulso():
    """Ticker y salud del sistema: una llamada pequeña para refresco frecuente."""
    with SesionLocal() as sesion:
        indicadores = {i.key: i for i in sesion.execute(select(Indicador)).scalars().all()}
        items = []
        for key in PULSO_KEYS:
            i = indicadores.get(key)
            if not i:
                continue
            items.append({
                "key": i.key, "nombre": i.nombre, "valor": i.valor,
                "formato": i.formato, "unidad": i.unidad,
                "fecha_valor": i.fecha_valor, "fuente_nombre": i.fuente_nombre,
                "serie": i.serie,
            })
        fuentes = _fuentes(sesion)
        logs = sesion.execute(
            select(FuenteLog).order_by(FuenteLog.ultima_ejecucion.desc()).limit(10)
        ).scalars().all()
        actividad = [{
            "fuente": l.fuente, "estado": l.estado, "detalle": l.detalle,
            "ultima_ejecucion": l.ultima_ejecucion.isoformat(),
            "duracion_ms": l.duracion_ms, "registros": l.registros,
        } for l in logs]
        conteos = {
            "indicadores": len(indicadores),
            "historia": sesion.query(EventoHistorico).count(),
            "problematicas": sesion.query(Problematica).count(),
            "departamentos": sesion.query(SecopDepartamento).count(),
            "votos": sesion.query(Voto).count(),
        }
        ultima = _ultima_actualizacion(sesion)
        activas = [f for f in fuentes if f["tipo"] == "en vivo"]
        estado = "ok" if activas and all(f["estado"] == "ok" for f in activas) else "degradado"
        if not activas:
            estado = "sin-datos"
    return {
        "items": items,
        "fuentes": fuentes,
        "actividad": actividad,
        "conteos": conteos,
        "actualizado_en": ultima,
        "proxima_ejecucion": proxima_ejecucion(),
        "estado": estado,
    }


@router.get("/actividad")
def actividad(limite: int = 20):
    limite = max(1, min(limite, 100))
    with SesionLocal() as sesion:
        logs = sesion.execute(
            select(FuenteLog).order_by(FuenteLog.ultima_ejecucion.desc()).limit(limite)
        ).scalars().all()
    return {"actividad": [{
        "fuente": l.fuente, "estado": l.estado, "detalle": l.detalle,
        "ultima_ejecucion": l.ultima_ejecucion.isoformat(),
        "duracion_ms": l.duracion_ms, "registros": l.registros,
    } for l in logs]}


@router.post("/refrescar")
def refrescar():
    """Verificación manual ahora mismo: corre en segundo plano, no bloquea la API."""
    t = threading.Thread(target=refrescar_sync, daemon=True)
    t.start()
    return {
        "estado": "verificación iniciada",
        "mensaje": "SARCOL está verificando las fuentes en este momento. Refresca en unos segundos.",
    }


@router.get("/fuentes")
def fuentes():
    """Directorio de fuentes con su orden de prioridad y estado real."""
    with SesionLocal() as sesion:
        return {"fuentes": _fuentes(sesion)}


@router.get("/eventos")
async def eventos_sse(request: Request):
    """Server-Sent Events: la interfaz recibe el avance de la verificación sin recargar."""
    eventos.registrar_loop(asyncio.get_running_loop())
    cola = eventos.suscribir()

    async def generador():
        try:
            yield "event: conectado\ndata: {\"ok\": true}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    item = await asyncio.wait_for(cola.get(), timeout=15)
                except asyncio.TimeoutError:
                    yield ": latido\n\n"
                    continue
                yield f"event: {item['tipo']}\ndata: {json.dumps(item, ensure_ascii=False)}\n\n"
        finally:
            eventos.desuscribir(cola)

    return StreamingResponse(
        generador(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )
