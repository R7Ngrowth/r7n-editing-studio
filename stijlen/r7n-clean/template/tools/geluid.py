"""Gedeelde geluidsanalyse: energiecurve van een wav (16 kHz mono) en de stukken waar gesproken wordt.

Gebruik vanuit envelope.py en knippen.py. Vraagt numpy:  uv run --with numpy python tools/envelope.py opname.wav
"""
from __future__ import annotations

import wave

import numpy as np

STAP = 0.01  # seconden per meetpunt


def laad(pad: str) -> tuple[np.ndarray, int]:
    with wave.open(pad, "rb") as w:
        sr = w.getframerate()
        n = w.getnframes()
        kanalen = w.getnchannels()
        data = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768.0
    if kanalen > 1:
        data = data.reshape(-1, kanalen).mean(axis=1)
    return data, sr


def energie_db(data: np.ndarray, sr: int) -> np.ndarray:
    """Geluidsniveau in dB per 10 ms."""
    venster = max(1, int(sr * STAP))
    n = len(data) // venster
    blokken = data[: n * venster].reshape(n, venster)
    rms = np.sqrt((blokken**2).mean(axis=1)) + 1e-9
    return 20 * np.log10(rms)


def spraak_stukken(db: np.ndarray, drempel_onder_piek: float = 32.0, vloer: float = -48.0, min_stilte: float = 0.3, min_spraak: float = 0.15) -> list[tuple[float, float]]:
    """Stukken (start, eind) waar gesproken wordt. Stiltes korter dan `min_stilte` tellen niet als onderbreking."""
    drempel = max(vloer, float(np.percentile(db, 97)) - drempel_onder_piek)
    luid = db > drempel
    stukken: list[list[float]] = []
    i = 0
    n = len(luid)
    while i < n:
        if not luid[i]:
            i += 1
            continue
        j = i
        while j < n:
            if luid[j]:
                j += 1
                continue
            # stilte: hoe lang?
            k = j
            while k < n and not luid[k]:
                k += 1
            if (k - j) * STAP < min_stilte and k < n:
                j = k
                continue
            break
        stukken.append([i * STAP, j * STAP])
        i = j
    return [(a, b) for a, b in stukken if b - a >= min_spraak]


def stiltes_in(db: np.ndarray, start: float, eind: float, min_stilte: float, drempel: float | None = None) -> list[tuple[float, float]]:
    """Stiltes langer dan `min_stilte` binnen (start, eind)."""
    if drempel is None:
        drempel = max(-48.0, float(np.percentile(db, 97)) - 32.0)
    a, b = int(start / STAP), min(len(db), int(eind / STAP))
    uit: list[tuple[float, float]] = []
    i = a
    while i < b:
        if db[i] > drempel:
            i += 1
            continue
        j = i
        while j < b and db[j] <= drempel:
            j += 1
        if (j - i) * STAP >= min_stilte:
            uit.append((i * STAP, j * STAP))
        i = j
    return uit
