"""Búsqueda transversal de SARCOL: indicadores, historia, problemáticas y territorios."""
import unicodedata

from fastapi import APIRouter
from sqlalchemy import select

from ..db import SesionLocal
from ..models import EventoHistorico, Indicador, Problematica, SecopDepartamento

router = APIRouter(prefix="/api/buscar", tags=["buscar"])

PAGINAS = [
    {"id": "panel", "titulo": "Sala de situación", "subtitulo": "Pulso del país en vivo", "ruta": "/panel", "badge": "Panel"},
    {"id": "instrumentos", "titulo": "Instrumentos", "subtitulo": "Catálogo de herramientas públicas", "ruta": "/herramientas", "badge": "Herramientas"},
    {"id": "estado", "titulo": "Colombia — Estado actual", "subtitulo": "Árbol de indicadores verificados", "ruta": "/estado-actual", "badge": "Datos"},
    {"id": "historia", "titulo": "Historia de Colombia", "subtitulo": "1810 → hoy, con rigor escalonado", "ruta": "/historia", "badge": "Memoria"},
    {"id": "problematicas", "titulo": "Problemáticas", "subtitulo": "Pirámide nacional, departamental y municipal", "ruta": "/problematicas", "badge": "Participación"},
    {"id": "soluciones", "titulo": "Soluciones", "subtitulo": "Propuestas con respaldo y voto", "ruta": "/soluciones", "badge": "Participación"},
    {"id": "mapa", "titulo": "Mapa · Regiones", "subtitulo": "Contratación pública por departamento", "ruta": "/mapa", "badge": "Territorio"},
    {"id": "fuentes", "titulo": "Fuentes y bitácora", "subtitulo": "Sala de máquinas de SARCOL", "ruta": "/fuentes", "badge": "Transparencia"},
    {"id": "metodologia", "titulo": "Metodología", "subtitulo": "Cómo se verifica y se explica cada dato", "ruta": "/metodologia", "badge": "Transparencia"},
    {"id": "datos-abiertos", "titulo": "Datos abiertos", "subtitulo": "API, descargas y citación", "ruta": "/datos-abiertos", "badge": "API"},
]


def _norm(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto or "")
    return "".join(c for c in texto if not unicodedata.combining(c)).lower().strip()


def _coincide(q: str, *campos: str) -> bool:
    return any(q in _norm(c) for c in campos if c)


@router.get("")
def buscar(q: str = "", limite: int = 6):
    """Devuelve grupos de resultados con ruta directa al recurso."""
    consulta = q.strip()
    if len(consulta) < 2:
        return {"query": consulta, "grupos": [], "total": 0}
    n = _norm(consulta)
    limite = max(1, min(limite, 12))
    grupos = []

    with SesionLocal() as sesion:
        indicadores = sesion.execute(select(Indicador).order_by(Indicador.nombre)).scalars().all()
        historia = sesion.execute(select(EventoHistorico).order_by(EventoHistorico.orden)).scalars().all()
        problemas = sesion.execute(select(Problematica).order_by(Problematica.orden)).scalars().all()
        departamentos = sesion.execute(
            select(SecopDepartamento).order_by(SecopDepartamento.procesos.desc())
        ).scalars().all()

    items_ind = [{
        "id": i.key, "titulo": i.nombre,
        "subtitulo": f"{i.categoria} · {i.fuente_nombre}",
        "ruta": f"/estado-actual?indicador={i.key}", "badge": "Indicador", "tipo": "indicador",
    } for i in indicadores if _coincide(n, i.nombre, i.categoria, i.descripcion_simple, i.key)]
    if items_ind:
        grupos.append({"tipo": "indicador", "etiqueta": "Indicadores", "items": items_ind[:limite]})

    items_hist = [{
        "id": e.slug, "titulo": e.titulo,
        "subtitulo": f"{e.fecha_str} · {e.categoria} · {e.administracion}",
        "ruta": f"/historia?evento={e.slug}", "badge": "Historia", "tipo": "historia",
    } for e in historia if _coincide(n, e.titulo, e.categoria, e.administracion, e.responsables, e.descripcion_simple)]
    if items_hist:
        grupos.append({"tipo": "historia", "etiqueta": "Historia", "items": items_hist[:limite]})

    items_prob = [{
        "id": p.slug, "titulo": p.titulo,
        "subtitulo": f"{p.nivel.title()} · {p.ambito} · {p.categoria}",
        "ruta": f"/problematicas?slug={p.slug}", "badge": "Problemática", "tipo": "problematica",
    } for p in problemas if _coincide(n, p.titulo, p.categoria, p.ambito, p.resumen_simple, p.analisis_tecnico)]
    if items_prob:
        grupos.append({"tipo": "problematica", "etiqueta": "Problemáticas", "items": items_prob[:limite]})

    items_sol = [{
        "id": p.slug, "titulo": p.titulo,
        "subtitulo": f"Propuesta · {p.ambito}",
        "ruta": f"/soluciones?slug={p.slug}", "badge": "Solución", "tipo": "solucion",
    } for p in problemas if p.solucion_analisis and _coincide(n, p.titulo, p.solucion_analisis, p.solucion_propuesta)]
    if items_sol:
        grupos.append({"tipo": "solucion", "etiqueta": "Soluciones", "items": items_sol[:limite]})

    items_dpto = [{
        "id": d.departamento, "titulo": d.departamento.title(),
        "subtitulo": f"{d.procesos:,} procesos · ${d.valor_referencial / 1e12:,.1f} billones COP".replace(",", "."),
        "ruta": f"/mapa?dpto={d.departamento}", "badge": "Departamento", "tipo": "departamento",
    } for d in departamentos if _coincide(n, d.departamento)]
    if items_dpto:
        grupos.append({"tipo": "departamento", "etiqueta": "Territorio", "items": items_dpto[:limite]})

    items_pag = [{
        "id": p["id"], "titulo": p["titulo"], "subtitulo": p["subtitulo"],
        "ruta": p["ruta"], "badge": p["badge"], "tipo": "pagina",
    } for p in PAGINAS if _coincide(n, p["titulo"], p["subtitulo"], p["badge"])]
    if items_pag:
        grupos.append({"tipo": "pagina", "etiqueta": "Instrumentos y páginas", "items": items_pag[:limite]})

    return {
        "query": consulta,
        "grupos": grupos,
        "total": sum(len(g["items"]) for g in grupos),
    }
