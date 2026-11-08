"""API del MAPA / REGIONES: contratación pública por departamento (SECOP II vivo) + notas."""
import re
import unicodedata

from fastapi import APIRouter
from sqlalchemy import select

from ..db import SesionLocal
from ..models import SecopDepartamento
from ..schemas import SecopDptoOut

router = APIRouter(prefix="/api/mapa", tags=["mapa"])

# Departamentos del GeoJSON canónico (33: 32 + Bogotá D.C.) — así siempre hay valor para todos
TODOS = [
    "AMAZONAS", "ANTIOQUIA", "ARAUCA", "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA",
    "ATLANTICO", "BOLIVAR", "BOYACA", "CALDAS", "CAQUETA", "CASANARE", "CAUCA", "CESAR",
    "CHOCO", "CORDOBA", "CUNDINAMARCA", "GUAINIA", "GUAVIARE", "HUILA", "LA GUAJIRA",
    "MAGDALENA", "META", "NARIÑO", "NORTE DE SANTANDER", "PUTUMAYO", "QUINDIO", "RISARALDA",
    "SANTAFE DE BOGOTA D.C", "SANTANDER", "SUCRE", "TOLIMA", "VALLE DEL CAUCA", "VAUPES", "VICHADA",
]


def _norm(nombre: str) -> str:
    """Normaliza nombres del SECOP (tildes, mayúsculas, puntuación) al GeoJSON canónico."""
    sin_tildes = "".join(
        c for c in unicodedata.normalize("NFKD", nombre or "")
        if not unicodedata.combining(c)
    )
    limpio = re.sub(r"[^A-Za-z0-9 ]", " ", sin_tildes).upper()
    return re.sub(r"\s+", " ", limpio).strip()


ALIAS = {
    "SAN ANDRES PROVIDENCIA Y SANTA CATALINA": "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA",
}


@router.get("/datos")
def datos():
    """Datos por departamento en nombre canónico del GeoJSON; los que no tienen procesos quedan en 0."""
    with SesionLocal() as sesion:
        rows = sesion.execute(select(SecopDepartamento)).scalars().all()
    por_dpto: dict[str, dict] = {}
    for r in rows:
        clave = _norm(r.departamento)
        clave = _norm(ALIAS.get(clave, clave))
        actual = por_dpto.setdefault(clave, {"procesos": 0, "valor_referencial": 0.0})
        actual["procesos"] += r.procesos
        actual["valor_referencial"] += r.valor_referencial
    filas = []
    for nombre in TODOS:
        d = por_dpto.get(_norm(nombre), {"procesos": 0, "valor_referencial": 0.0})
        filas.append(SecopDptoOut(
            departamento=nombre, procesos=d["procesos"], valor_referencial=d["valor_referencial"],
        ).model_dump())
    filas.sort(key=lambda f: f["procesos"], reverse=True)
    total_procesos = sum(f["procesos"] for f in filas)
    total_valor = sum(f["valor_referencial"] for f in filas)
    return {
        "departamentos": filas,
        "total_procesos": total_procesos,
        "total_valor": total_valor,
        "nota": "Procesos publicados en SECOP II (últimos 365 días) por departamento de la entidad contratante; no incluye registros sin departamento identificado. Fuente: SECOP II — Colombia Compra Eficiente, vía datos.gov.co. Valor referencial = suma de precio_base en COP; no es gasto ejecutado: puede incluir contratos multianuales y varias filas del mismo portafolio.",
    }
