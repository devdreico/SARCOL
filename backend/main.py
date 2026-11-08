"""SARCOL — Backend (FastAPI).

Sociedad Autónoma Regulatoria de Cumplimiento en Operaciones Legales.
Sistematiza la confianza en los datos del país: ingesta diaria de fuentes
priorizadas, doble explicación por dato y voto anónimo incorruptible.

Ejecutar:  cd backend && uvicorn main:app --reload --port 8000
"""
import logging
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse

from app.config import CORS_ORIGINS, BASE_DIR
from app.db import crear_tablas
from app.seed import sembrar
from app.ingesta.refresco import refrescar_sync, hay_datos
from app.scheduler import iniciar_scheduler, parar_scheduler
from app.routers import (
    estado, historia, problematicas, soluciones, votos, mapa, meta,
    panel, buscar, export,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s · %(name)s · %(message)s")
log = logging.getLogger("sarcol")

app = FastAPI(
    title="SARCOL API",
    description="Datos de Colombia verificados, con doble explicación y voto anónimo.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=800)

app.include_router(panel.router)
app.include_router(estado.router)
app.include_router(historia.router)
app.include_router(problematicas.router)
app.include_router(soluciones.router)
app.include_router(votos.router)
app.include_router(mapa.router)
app.include_router(meta.router)
app.include_router(buscar.router)
app.include_router(export.router)


@app.on_event("startup")
def al_arrancar():
    crear_tablas()
    sembrar()
    iniciar_scheduler()
    if not hay_datos():
        # Primera verificación en segundo plano para no bloquear el arranque
        log.info("Base sin datos: iniciando primera verificación de fuentes en segundo plano…")
        threading.Thread(target=refrescar_sync, daemon=True).start()
    # Frontend compilado (si existe): SPA con fallback a index.html
    _dist = BASE_DIR.parent / "frontend" / "dist"
    if _dist.exists():
        index = _dist / "index.html"

        @app.get("/{ruta:path}", include_in_schema=False)
        async def spa(ruta: str):
            archivo = (_dist / ruta).resolve()
            if str(archivo).startswith(str(_dist)) and archivo.is_file():
                return FileResponse(archivo)
            return FileResponse(index, media_type="text/html")


@app.on_event("shutdown")
def al_apagar():
    parar_scheduler()


@app.get("/api")
def raiz():
    return {
        "nombre": "SARCOL API",
        "entidad": "Sociedad Autónoma Regulatoria de Cumplimiento en Operaciones Legales",
        "mensaje": "Datos de Colombia en un solo lugar, con doble explicación y voto anónimo.",
        "version": "2.0.0",
        "rutas": [
            "/api/panel", "/api/estado/arbol", "/api/estado/comparativa",
            "/api/historia", "/api/problematicas", "/api/soluciones",
            "/api/mapa/datos", "/api/meta/pulso", "/api/meta/fuentes",
            "/api/meta/actividad", "/api/meta/eventos", "/api/buscar?q=colombia",
            "/api/export/indicadores.csv", "/api/health",
        ],
    }


@app.get("/api/health")
def health():
    """Chequeo de salud para monitoreo y para la barra de sistema."""
    from app.db import SesionLocal
    from app.models import FuenteLog, Indicador
    from sqlalchemy import select
    from datetime import datetime, timezone

    with SesionLocal() as sesion:
        indicadores = sesion.query(Indicador).count()
        con_dato = sesion.query(Indicador).filter(Indicador.valor.isnot(None)).count()
        ultimo = sesion.execute(
            select(FuenteLog).order_by(FuenteLog.ultima_ejecucion.desc()).limit(1)
        ).scalar_one_or_none()
    return {
        "estado": "ok",
        "version": "2.0.0",
        "indicadores": indicadores,
        "indicadores_con_dato": con_dato,
        "ultima_verificacion": ultimo.ultima_ejecucion.isoformat() if ultimo else None,
        "hora_servidor": datetime.now(timezone.utc).isoformat(),
    }


# Frontend compilado (si existe), servido por el mismo servidor en producción
