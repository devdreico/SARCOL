"""Ingesta SECOP II (Colombia Compra Eficiente, vía datos.gov.co).

Recurso verificado: p6dx-8zbt — "SECOP II - Procesos de Contratación".
Consulta en vivo con SoQL: agregación por departamento de la entidad contratante
y totales nacionales de los últimos 365 días.
"""
from datetime import datetime, timedelta, timezone

import httpx

RECURSO = "https://www.datos.gov.co/resource/p6dx-8zbt.json"

# Normalización del nombre de departamento de SECOP II → nombre canónico del mapa GeoJSON
CANON = {
    "DISTRICTO CAPITAL DE BOGOTÁ": "SANTAFE DE BOGOTA D.C",
    "DISTRITO CAPITAL DE BOGOTÁ": "SANTAFE DE BOGOTA D.C",
    "BOGOTÁ D.C.": "SANTAFE DE BOGOTA D.C",
    "ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA": "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA",
    "ARCHIPIÉLAGO DE SAN ANDRÉS PROVIDENCIA Y SANTA CATALINA": "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA",
    "LA GUAJIRA": "LA GUAJIRA",
    "NARIÑO": "NARIÑO",
    "SANTAFÉ DE BOGOTÁ D.C": "SANTAFE DE BOGOTA D.C",
}
IGNORAR = {"NO DEFINIDO", "NO DEF.", "EXTERIOR", "NO IDENTIFICADO"}


def _normalizar(nombre: str) -> str:
    if not nombre:
        return ""
    n = nombre.strip().upper()
    if n in CANON:
        return CANON[n]
    # 'VALE DEL CAUCA' typos y 'ARCHIPIÉLAGO...' variantes: recorte simple
    return n.replace("SANTAFE DE BOGOTA D.C", "SANTAFE DE BOGOTA D.C")


async def obtener_secop() -> dict:
    """
    Devuelve:
      {
        "total_procesos": int, "total_valor": float,
        "por_departamento": [{"departamento": canon, "procesos": int, "valor_referencial": float}]
      }
    Ventana: últimos 365 días según fecha_de_publicacion_del.
    """
    hace_un_ano = (datetime.now(timezone.utc) - timedelta(days=365)).strftime("%Y-%m-%d")
    where = f"fecha_de_publicacion_del>'{hace_un_ano}'"
    out = {"total_procesos": 0, "total_valor": 0.0, "por_departamento": []}
    async with httpx.AsyncClient(follow_redirects=True, timeout=60) as client:
        # Totales nacionales
        r = await client.get(RECURSO, params={
            "$select": "count(*) as total, sum(precio_base) as valor",
            "$where": where,
        })
        r.raise_for_status()
        fila = r.json()[0] if r.json() else {}
        out["total_procesos"] = int(float(fila.get("total") or 0))
        out["total_valor"] = float(fila.get("valor") or 0)

        # Agregación por departamento
        r = await client.get(RECURSO, params={
            "$select": "departamento_entidad as dpto, count(*) as procesos, sum(precio_base) as valor",
            "$where": where,
            "$group": "departamento_entidad",
            "$order": "procesos DESC",
            "$limit": "50",
        })
        r.raise_for_status()
        for fila in r.json():
            nombre = _normalizar(fila.get("dpto") or "")
            if not nombre or nombre in IGNORAR:
                continue
            out["por_departamento"].append({
                "departamento": nombre,
                "procesos": int(float(fila.get("procesos") or 0)),
                "valor_referencial": float(fila.get("valor") or 0),
            })
    return out
