"""Bus de eventos en vivo para SSE.

El refresco corre en un hilo aparte; los clientes SSE viven en el loop de
FastAPI. `publicar` es thread-safe y despacha al loop registrado.
"""
import asyncio
import threading
from datetime import datetime, timezone

_suscriptores: set[asyncio.Queue] = set()
_loop: asyncio.AbstractEventLoop | None = None
_lock = threading.Lock()


def registrar_loop(loop: asyncio.AbstractEventLoop):
    global _loop
    _loop = loop


def suscribir() -> asyncio.Queue:
    cola: asyncio.Queue = asyncio.Queue(maxsize=64)
    with _lock:
        _suscriptores.add(cola)
    return cola


def desuscribir(cola: asyncio.Queue):
    with _lock:
        _suscriptores.discard(cola)


def publicar(tipo: str, data: dict):
    payload = {
        "tipo": tipo,
        "data": data,
        "ts": datetime.now(timezone.utc).isoformat(),
    }

    def _despachar():
        with _lock:
            colas = list(_suscriptores)
        for cola in colas:
            try:
                cola.put_nowait(payload)
            except asyncio.QueueFull:
                pass

    loop = _loop
    if loop and loop.is_running():
        loop.call_soon_threadsafe(_despachar)
