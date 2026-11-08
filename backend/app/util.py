"""Utilidades de hashing para el sistema de votos incorruptibles."""
import hashlib

from .config import SALT_IP


def sha256(texto: str) -> str:
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def hash_ip(ip: str | None) -> str:
    if not ip:
        return ""
    return sha256(f"{SALT_IP}:{ip}")[:32]
