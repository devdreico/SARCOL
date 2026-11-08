"""Actualización diaria automática: APScheduler ejecuta la verificación completa a las 5:00 AM hora Colombia (10:00 UTC)."""
import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .ingesta.refresco import refrescar_sync

log = logging.getLogger("sarcol.scheduler")
_scheduler = BackgroundScheduler(timezone="UTC")


def tarea_diaria():
    log.info("Iniciando verificación diaria de datos…")
    resumen = refrescar_sync()
    log.info("Verificación diaria completa: %s", resumen)


def iniciar_scheduler():
    _scheduler.add_job(tarea_diaria, CronTrigger(hour=10, minute=0), id="verificacion_diaria",
                       replace_existing=True, misfire_grace_time=3600)
    _scheduler.start()
    log.info("Scheduler iniciado (verificación diaria 05:00 COL)")


def parar_scheduler():
    try:
        _scheduler.shutdown(wait=False)
    except Exception:  # noqa: BLE001
        pass


def proxima_ejecucion() -> str | None:
    job = _scheduler.get_job("verificacion_diaria")
    if job and job.next_run_time:
        return job.next_run_time.isoformat()
    return None
