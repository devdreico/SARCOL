"""Ingesta del Banco Mundial: series de Colombia + comparativas internacionales."""
import asyncio

import httpx

from ..config import PAISES_COMPARATIVOS, NOMBRES_PAISES
from ..data.indicadores_def import INDICADORES

BASE = "https://api.worldbank.org/v2"
PARES = [c for c in PAISES_COMPARATIVOS if c != "COL"]


async def _serie_colombia(client: httpx.AsyncClient, codigo: str) -> list | None:
    """Serie histórica de Colombia 2014→año actual para la línea de tiempo."""
    try:
        r = await client.get(
            f"{BASE}/country/COL/indicator/{codigo}",
            params={"format": "json", "per_page": 20, "date": "2014:2026"},
            timeout=20,
        )
        r.raise_for_status()
        datos = r.json()
        if not isinstance(datos, list) or len(datos) < 2:
            return None
        serie = [
            {"x": int(d["date"]), "y": round(float(d["value"]), 4)}
            for d in sorted(datos[1], key=lambda d: d["date"])
            if d.get("value") is not None
        ]
        return serie or None
    except Exception:
        return None


async def _comparativas(client: httpx.AsyncClient, codigo: str) -> list | None:
    """Valor más reciente (mrnev=1) de cada país de referencia en una sola llamada."""
    paises = ";".join(["COL"] + PARES)
    try:
        r = await client.get(
            f"{BASE}/country/{paises}/indicator/{codigo}",
            params={"format": "json", "per_page": 30, "mrnev": 1},
            timeout=20,
        )
        r.raise_for_status()
        datos = r.json()
        if not isinstance(datos, list) or len(datos) < 2:
            return None
        comp = []
        for d in datos[1]:
            if d.get("value") is not None:
                iso = d["countryiso3code"]
                comp.append({
                    "pais": NOMBRES_PAISES.get(iso, iso),
                    "iso": iso,
                    "valor": round(float(d["value"]), 4),
                    "anio": d["date"],
                })
        return comp or None
    except Exception:
        return None


async def obtener_banco_mundial() -> dict:
    """Devuelve {key_indicador: {"valor","fecha_valor","serie","comparativas"}} para todos los WB."""
    resultado: dict = {}
    async with httpx.AsyncClient(follow_redirects=True) as client:
        tareas = []
        defs_wb = [d for d in INDICADORES if d.get("codigo")]
        for d in defs_wb:
            tareas.append((d, _serie_colombia(client, d["codigo"]), _comparativas(client, d["codigo"])))
        for d, t_serie, t_comp in tareas:
            serie, comp = await asyncio.gather(t_serie, t_comp)
            if serie:
                ultimo = serie[-1]
                resultado[d["key"]] = {
                    "valor": ultimo["y"],
                    "fecha_valor": str(ultimo["x"]),
                    "serie": serie,
                    "comparativas": comp,
                }
    return resultado
