"""Seeds idempotentes: historia, problemáticas e indicadores.

Los indicadores se siembran con valor nulo para que el árbol de la API exista
desde el primer arranque; la verificación de fuentes los completa después.
"""
from sqlalchemy import select

from .config import FUENTES
from .db import SesionLocal
from .models import EventoHistorico, Indicador, Problematica
from .data.historia_seed import ERAS, EVENTOS
from .data.problematicas_seed import PROBLEMATICAS
from .data.indicadores_def import INDICADORES


def sembrar_indicadores(sesion):
    # Claves retiradas o fusionadas en una definición vigente.
    for obsoleta in ("empleo_vulnerable",):
        sesion.query(Indicador).filter(Indicador.key == obsoleta).delete()
    existentes = set(sesion.execute(select(Indicador.key)).scalars())
    for d in INDICADORES:
        if d["key"] in existentes:
            continue
        fuente = FUENTES.get(d["fuente_key"], {})
        sesion.add(Indicador(
            key=d["key"],
            nombre=d["nombre"],
            categoria=d["categoria"],
            unidad=d.get("unidad", ""),
            formato=d.get("formato", "float"),
            descripcion_simple=d.get("simple", ""),
            descripcion_tecnica=d.get("tecnica", ""),
            fuente_key=d["fuente_key"],
            fuente_nombre=d.get("fuente_nombre", fuente.get("nombre", "")),
            fuente_url=fuente.get("url", ""),
            fuente_tier=d.get("tier", fuente.get("tier", 3)),
            valor=None,
            fecha_valor="",
            nota=d.get("nota", ""),
        ))


def sembrar():
    with SesionLocal() as sesion:
        eventos_existentes = set(sesion.execute(select(EventoHistorico.slug)).scalars())
        for e in EVENTOS:
            if e["slug"] not in eventos_existentes:
                sesion.add(EventoHistorico(
                    slug=e["slug"], era=e["era"], anio=e["anio"], fecha_str=e["fecha_str"],
                    titulo=e["titulo"], categoria=e["categoria"],
                    administracion=e.get("administracion", ""), responsables=e.get("responsables", ""),
                    impacto=e["impacto"], descripcion_simple=e["simple"],
                    descripcion_tecnica=e["tecnica"], fuentes=e.get("fuentes", []),
                    verificacion=e.get("verificacion", "verificado"), orden=float(e["anio"]),
                ))

        prob_existentes = set(sesion.execute(select(Problematica.slug)).scalars())
        for p in PROBLEMATICAS:
            if p["slug"] not in prob_existentes:
                sesion.add(Problematica(
                    slug=p["slug"], titulo=p["titulo"], nivel=p["nivel"], ambito=p["ambito"],
                    categoria=p["categoria"], es_decision_activa=p.get("es_decision_activa", False),
                    fecha_decision=p.get("fecha_decision", ""),
                    resumen_simple=p["resumen_simple"], analisis_tecnico=p["analisis_tecnico"],
                    solucion_analisis=p["solucion_analisis"], solucion_propuesta=p["solucion_propuesta"],
                    fuentes=p.get("fuentes", []), orden=float(p["orden"]),
                ))

        sembrar_indicadores(sesion)
        sesion.commit()


def borrar_todo():
    """Opción de resincronización total: borra historia y problemáticas y vuelve a sembrar."""
    with SesionLocal() as sesion:
        sesion.query(EventoHistorico).delete()
        sesion.query(Problematica).delete()
        sesion.commit()
    sembrar()
