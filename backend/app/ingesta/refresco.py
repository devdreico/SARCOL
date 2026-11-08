"""Orquestador del sistema de verificación: ejecuta todas las ingestas y persiste."""
import asyncio
import threading
import time
from datetime import datetime, timezone

from ..db import SesionLocal
from ..models import Indicador, FuenteLog, SecopDepartamento, ahora
from ..data.indicadores_def import INDICADORES
from .. import eventos
from . import secop, trm, worldbank

_lock = threading.Lock()


def _guardar_log(sesion, fuente: str, estado: str, detalle: str,
                 duracion_ms: int = 0, registros: int = 0):
    sesion.add(FuenteLog(
        fuente=fuente, estado=estado, detalle=detalle,
        duracion_ms=duracion_ms, registros=registros, ultima_ejecucion=ahora(),
    ))


def _upsert_indicador(sesion, datos: dict, extra: dict | None = None):
    key = datos["key"]
    defn = next(d for d in INDICADORES if d["key"] == key)
    ind = sesion.get(Indicador, key)
    if ind is None:
        ind = Indicador(
            key=key,
            fuente_url="",
            nota=defn.get("nota", ""),
        )
        sesion.add(ind)
    # La definición manda: mantiene nombre, categoría, textos y fuente sincronizados.
    ind.nombre = defn["nombre"]
    ind.categoria = defn["categoria"]
    ind.unidad = defn["unidad"]
    ind.formato = defn["formato"]
    ind.descripcion_simple = defn["simple"]
    ind.descripcion_tecnica = defn["tecnica"]
    ind.fuente_key = defn["fuente_key"]
    ind.fuente_tier = defn.get("tier", 3)
    ind.fuente_nombre = defn["fuente_nombre"]
    ind.nota = defn.get("nota", "")
    for campo, valor in datos.items():
        if campo != "key":
            setattr(ind, campo, valor)
    if extra:
        for campo, valor in extra.items():
            setattr(ind, campo, valor)


def _formatos_url(fuente_key: str) -> str:
    from ..config import FUENTES
    return FUENTES.get(fuente_key, {}).get("url", "")


def refrescar_sync():
    """Ejecuta todas las ingestas (bloquea hasta terminar). thread-safe."""
    with _lock:
        loop = asyncio.new_event_loop()
        try:
            asyncio.set_event_loop(loop)
            return loop.run_until_complete(refrescar_async())
        finally:
            loop.close()
            asyncio.set_event_loop(None)


async def refrescar_async():
    resumen = {}
    eventos.publicar("refresco", {"estado": "iniciado"})
    with SesionLocal() as sesion:
        # ── Banco Mundial ──
        t0 = time.perf_counter()
        try:
            datos = await worldbank.obtener_banco_mundial()
            n = 0
            for key, d in datos.items():
                _upsert_indicador(
                    sesion,
                    {"key": key, "valor": d["valor"], "fecha_valor": d["fecha_valor"],
                     "serie": d["serie"], "comparativas": d.get("comparativas")},
                    extra={"fuente_url": "https://api.worldbank.org/v2/country/COL"},
                )
                n += 1
            ms = int((time.perf_counter() - t0) * 1000)
            _guardar_log(sesion, "Banco Mundial", "ok", f"{n} indicadores verificados", ms, n)
            eventos.publicar("fuente", {"fuente": "Banco Mundial", "estado": "ok",
                                        "detalle": f"{n} indicadores verificados", "duracion_ms": ms})
            resumen["worldbank"] = n
        except Exception as e:  # noqa: BLE001
            ms = int((time.perf_counter() - t0) * 1000)
            _guardar_log(sesion, "Banco Mundial", "error", str(e)[:300], ms, 0)
            eventos.publicar("fuente", {"fuente": "Banco Mundial", "estado": "error",
                                        "detalle": str(e)[:300], "duracion_ms": ms})
            resumen["worldbank"] = 0

        # ── SECOP II ──
        t0 = time.perf_counter()
        try:
            s = await secop.obtener_secop()
            _upsert_indicador(sesion, {
                "key": "secop_procesos", "valor": float(s["total_procesos"]),
                "fecha_valor": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            }, extra={"fuente_url": "https://www.datos.gov.co/resource/p6dx-8zbt"})
            _upsert_indicador(sesion, {
                "key": "secop_valor", "valor": s["total_valor"],
                "fecha_valor": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            }, extra={"fuente_url": "https://www.datos.gov.co/resource/p6dx-8zbt"})
            sesion.query(SecopDepartamento).delete()
            for fila in s["por_departamento"]:
                sesion.add(SecopDepartamento(**fila))
            ms = int((time.perf_counter() - t0) * 1000)
            _guardar_log(sesion, "SECOP II", "ok",
                         f"{s['total_procesos']} procesos · {len(s['por_departamento'])} departamentos",
                         ms, s["total_procesos"])
            eventos.publicar("fuente", {"fuente": "SECOP II", "estado": "ok",
                                        "detalle": f"{s['total_procesos']} procesos", "duracion_ms": ms})
            resumen["secop"] = s["total_procesos"]
        except Exception as e:  # noqa: BLE001
            ms = int((time.perf_counter() - t0) * 1000)
            _guardar_log(sesion, "SECOP II", "error", str(e)[:300], ms, 0)
            eventos.publicar("fuente", {"fuente": "SECOP II", "estado": "error",
                                        "detalle": str(e)[:300], "duracion_ms": ms})
            resumen["secop"] = 0

        # ── TRM ──
        t0 = time.perf_counter()
        try:
            t = await trm.obtener_trm()
            if t:
                _upsert_indicador(sesion, {
                    "key": "trm", "valor": t["valor"], "fecha_valor": t["fecha"],
                    "serie": t.get("serie"),
                }, extra={"fuente_url": "https://www.datos.gov.co/resource/32sa-8pi3"})
                ms = int((time.perf_counter() - t0) * 1000)
                _guardar_log(sesion, "TRM Superfinanciera", "ok", f"${t['valor']:,.2f}", ms, 1)
                eventos.publicar("fuente", {"fuente": "TRM Superfinanciera", "estado": "ok",
                                            "detalle": f"${t['valor']:,.2f}", "duracion_ms": ms})
                resumen["trm"] = t["valor"]
        except Exception as e:  # noqa: BLE001
            ms = int((time.perf_counter() - t0) * 1000)
            _guardar_log(sesion, "TRM Superfinanciera", "error", str(e)[:300], ms, 0)
            eventos.publicar("fuente", {"fuente": "TRM Superfinanciera", "estado": "error",
                                        "detalle": str(e)[:300], "duracion_ms": ms})
            resumen["trm"] = None

        sesion.commit()

        # ── Completar fuentes en indicadores creados ──
        rows = sesion.query(Indicador).all()
        for ind in rows:
            if not ind.fuente_url:
                defn = next((d for d in INDICADORES if d["key"] == ind.key), None)
                if defn:
                    ind.fuente_url = {
                        "worldbank": "https://api.worldbank.org/v2/country/COL",
                        "secop": "https://www.datos.gov.co/resource/p6dx-8zbt",
                        "superfinanciera": "https://www.datos.gov.co/resource/32sa-8pi3",
                        "dane": "https://www.dane.gov.co",
                    }.get(defn["fuente_key"], "")
        sesion.commit()

    eventos.publicar("refresco", {"estado": "completado", "resumen": resumen})
    return resumen


def hay_datos() -> bool:
    with SesionLocal() as sesion:
        return sesion.query(Indicador).filter(Indicador.valor.isnot(None)).count() > 0
