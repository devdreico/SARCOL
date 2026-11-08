"""Configuración global de SARCOL."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent          # backend/
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Base de datos SQLite (migrable a PostgreSQL cambiando esta URL)
DATABASE_URL = f"sqlite:///{DATA_DIR / 'sarcol.db'}"

# Sal para hashear IPs (no para huellas de dispositivo, que llegan ya hasheadas)
SALT_IP = "SARCOL-IP-2026"

# Orígenes permitidos para el frontend (CORS abierto: el voto no usa cookies)
CORS_ORIGINS = ["*"]

# Fuentes: orden de prioridad definido por SARCOL
#   TIER 1 — Estatales / datos duros (la base de la verdad objetiva)
#   TIER 2 — Institucionales (marco legal real, contratación, emisor)
#   TIER 3 — Verificado independiente / comparativo internacional
#
# `tipo`: "en vivo" cuando SARCOL consulta una API o dataset; "contexto"
# cuando la fuente respalda historia, problemáticas o metodología sin ingesta.
FUENTES = {
    "dane": {
        "nombre": "DANE — Departamento Administrativo Nacional de Estadística",
        "url": "https://www.dane.gov.co",
        "tier": 1,
        "tipo": "contexto",
        "frecuencia": "Series oficiales",
        "cobertura": "Nacional · departamental · municipal",
        "log_name": "DANE",
        "descripcion": "El suelo firme del país: pobreza, desempleo, demografía.",
    },
    "secop": {
        "nombre": "SECOP II / Colombia Compra Eficiente (vía datos.gov.co)",
        "url": "https://www.datos.gov.co/resource/p6dx-8zbt",
        "tier": 2,
        "tipo": "en vivo",
        "frecuencia": "Cada 6 horas",
        "cobertura": "Nacional · 33 departamentos",
        "log_name": "SECOP II",
        "descripcion": "Dónde y cómo se gasta el dinero público, medible y auditable.",
    },
    "superfinanciera": {
        "nombre": "Superintendencia Financiera — TRM (vía datos.gov.co)",
        "url": "https://www.datos.gov.co/resource/32sa-8pi3",
        "tier": 2,
        "tipo": "en vivo",
        "frecuencia": "Diaria",
        "cobertura": "Nacional",
        "log_name": "TRM Superfinanciera",
        "descripcion": "Tasa Representativa del Mercado, actualizada cada día hábil.",
    },
    "worldbank": {
        "nombre": "Banco Mundial — Series abiertas de desarrollo",
        "url": "https://api.worldbank.org/v2/country/COL",
        "tier": 3,
        "tipo": "en vivo",
        "frecuencia": "Diaria · series anuales",
        "cobertura": "Colombia · 10 países de referencia · Mundo",
        "log_name": "Banco Mundial",
        "descripcion": "Series históricas verificables y comparativas internacionales.",
    },
    "rama_judicial": {
        "nombre": "Rama Judicial y Altas Cortes (Corte Constitucional, Corte Suprema, Consejo de Estado)",
        "url": "https://www.corteconstitucional.gov.co",
        "tier": 2,
        "tipo": "contexto",
        "frecuencia": "Permanente",
        "cobertura": "Nacional",
        "log_name": "Rama Judicial",
        "descripcion": "El marco legal real, por encima del debate de redes.",
    },
    "la_silla_vacia": {
        "nombre": "La Silla Vacía (fact-checking, mapa del poder)",
        "url": "https://www.lasillavacia.com",
        "tier": 3,
        "tipo": "contexto",
        "frecuencia": "Permanente",
        "cobertura": "Nacional",
        "log_name": "La Silla Vacía",
        "descripcion": "Contraste del discurso político, verificado independientemente.",
    },
    "cuestion_publica": {
        "nombre": "Cuestión Pública (periodismo de datos)",
        "url": "https://cuestionpublica.com",
        "tier": 3,
        "tipo": "contexto",
        "frecuencia": "Permanente",
        "cobertura": "Nacional",
        "log_name": "Cuestión Pública",
        "descripcion": "Redes de corrupción y visualización de relaciones de poder.",
    },
    "consejo_redaccion": {
        "nombre": "Consejo de Redacción (investigación regional)",
        "url": "https://www.consejoderedaccion.co",
        "tier": 3,
        "tipo": "contexto",
        "frecuencia": "Permanente",
        "cobertura": "Regional",
        "log_name": "Consejo de Redacción",
        "descripcion": "Investigación profunda descentralizada en las regiones.",
    },
    "verdad_abierta": {
        "nombre": "VerdadAbierta.com (conflicto, tierras, derechos humanos)",
        "url": "https://www.verdadabierta.com",
        "tier": 3,
        "tipo": "contexto",
        "frecuencia": "Permanente",
        "cobertura": "Nacional · regional",
        "log_name": "VerdadAbierta",
        "descripcion": "Análisis de datos sobre conflicto armado y procesos de paz.",
    },
    "cnmh": {
        "nombre": "CNMH · JEP · Comisión de la Verdad (memoria histórica)",
        "url": "https://centromemoria.gov.co",
        "tier": 3,
        "tipo": "contexto",
        "frecuencia": "Permanente",
        "cobertura": "Nacional · regional",
        "log_name": "Memoria histórica",
        "descripcion": "Relatos y registros verificados del conflicto armado colombiano.",
    },
}

# Países de referencia para comparativas internacionales (código ISO3 Banco Mundial)
PAISES_COMPARATIVOS = ["COL", "MEX", "BRA", "ARG", "CHL", "PER", "ECU", "VEN", "USA", "ESP", "WLD"]

NOMBRES_PAISES = {
    "COL": "Colombia", "MEX": "México", "BRA": "Brasil", "ARG": "Argentina",
    "CHL": "Chile", "PER": "Perú", "ECU": "Ecuador", "VEN": "Venezuela",
    "USA": "Estados Unidos", "ESP": "España", "WLD": "Mundo",
}
