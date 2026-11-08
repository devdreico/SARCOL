"""Ingesta TRM — Tasa Representativa del Mercado (Superintendencia Financiera).

Recurso verificado: 32sa-8pi3 — "Tasa de Cambio Representativa del Mercado - TRM".
"""
import httpx

RECURSO = "https://www.datos.gov.co/resource/32sa-8pi3.json"


async def obtener_trm() -> dict | None:
    """Última TRM publicada + serie de los últimos 30 días hábiles."""
    async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
        r = await client.get(
            RECURSO,
            params={"$order": "vigenciadesde DESC", "$limit": 30},
        )
        r.raise_for_status()
        filas = r.json()
        if not filas:
            return None
        serie = []
        for fila in reversed(filas):
            fecha = str(fila.get("vigenciadesde", ""))[:10]
            try:
                valor = float(fila["valor"])
            except (KeyError, TypeError, ValueError):
                continue
            if fecha and valor > 0:
                serie.append({"x": fecha, "y": valor})
        fila = filas[0]
        return {
            "valor": float(fila["valor"]),
            "fecha": str(fila.get("vigenciadesde", ""))[:10],
            "serie": serie or None,
        }
