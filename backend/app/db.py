"""Conexión y esquema de la base de datos."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SesionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def crear_tablas():
    from . import models  # noqa: F401 — registrar modelos
    Base.metadata.create_all(engine)

    # Migración ligera para SQLite: añade columnas nuevas sin borrar datos.
    from sqlalchemy import inspect

    insp = inspect(engine)
    if "fuentes_log" in insp.get_table_names():
        columnas = {c["name"] for c in insp.get_columns("fuentes_log")}
        with engine.begin() as conn:
            if "duracion_ms" not in columnas:
                conn.exec_driver_sql("ALTER TABLE fuentes_log ADD COLUMN duracion_ms INTEGER NOT NULL DEFAULT 0")
            if "registros" not in columnas:
                conn.exec_driver_sql("ALTER TABLE fuentes_log ADD COLUMN registros INTEGER NOT NULL DEFAULT 0")
