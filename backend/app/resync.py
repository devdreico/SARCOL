"""Resincronización manual del contenido (historia + problemáticas).

Uso:  cd backend && python -m app.resync          → inserta nuevos registros (idempotente)
      cd backend && python -m app.resync --full   → borra y vuelve a sembrar todo
"""
import sys

from .seed import sembrar, borrar_todo

if __name__ == "__main__":
    if "--full" in sys.argv:
        borrar_todo()
        print("✔ Contenido borrado y re-sembrado por completo.")
    else:
        sembrar()
        print("✔ Contenido sincronizado (los nuevos registros fueron insertados).")
