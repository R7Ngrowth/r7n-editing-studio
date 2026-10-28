#!/usr/bin/env python3
"""Knipt de gekozen takes uit de bron en haalt lange pauzes weg. Resultaat: public/speaker.mp4 + public/speaker.wav.

Gebruik:  uv run --with numpy python tools/knippen.py montage.json
montage.json:
{
  "bron": "/pad/naar/opname.mov",
  "pauzeMax": 0.3,               # pauzes langer dan dit worden ingekort tot `pauzeHoud`
  "pauzeHoud": 0.18,
  "takes": [ {"start": 12.4, "eind": 18.9, "noot": "zin 1, tweede take: vloeiend"}, ... ]
}
Knipt nooit midden in een woord: alleen stilte wordt ingekort, met wat lucht eraan vast.
Schrijft analyse/cuts.json met elk stuk en waar het in de nieuwe video terechtkomt (handig voor controle).
"""
import json
import os
import pathlib
import subprocess
import sys

from geluid import energie_db, laad, stiltes_in

RAND = 0.08  # seconden lucht die we bij elke snede laten staan


def ffmpeg(*args: str) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def main() -> None:
    cfg = json.loads(pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "montage.json").read_text())
    bron = cfg["bron"]
    pauze_max = float(cfg.get("pauzeMax", 0.3))
    pauze_houd = float(cfg.get("pauzeHoud", 0.18))
    os.makedirs("analyse", exist_ok=True)
    os.makedirs("public", exist_ok=True)

    wav = "analyse/opname.wav"
    if not os.path.exists(wav):
        ffmpeg("-i", bron, "-vn", "-ac", "1", "-ar", "16000", wav)
    data, sr = laad(wav)
    db = energie_db(data, sr)

    # Per take: de stiltes die te lang zijn, inkorten tot pauze_houd (symmetrisch rond het midden van de stilte).
    stukken: list[tuple[float, float]] = []
    for take in cfg["takes"]:
        s, e = float(take["start"]), float(take["eind"])
        cursor = s
        for a, b in stiltes_in(db, s, e, pauze_max):
            if b - a <= pauze_max:
                continue
            # Houd aan weerskanten van de stilte de helft van `pauze_houd` (minstens RAND lucht) en knip het midden weg.
            houd = max(pauze_houd / 2, RAND)
            if b - a <= 2 * houd:
                continue
            stukken.append((cursor, a + houd))
            cursor = b - houd
        stukken.append((cursor, e))
    stukken = [(a, b) for a, b in stukken if b - a > 0.05]

    # ffmpeg: elk stuk trimmen en achter elkaar plakken (beeld en geluid), 30 fps, 1080×1920.
    f = []
    for i, (a, b) in enumerate(stukken):
        f.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS[v{i}]")
        f.append(f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS[a{i}]")
    f.append("".join(f"[v{i}][a{i}]" for i in range(len(stukken))) + f"concat=n={len(stukken)}:v=1:a=1[v][a]")
    f.append("[v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p[vo]")
    ffmpeg("-i", bron, "-filter_complex", ";".join(f), "-map", "[vo]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "public/speaker.mp4")
    ffmpeg("-i", "public/speaker.mp4", "-vn", "-ac", "1", "-ar", "16000", "public/speaker.wav")

    # Kaart van oud naar nieuw, voor controle en voor het rapport.
    t = 0.0
    kaart = []
    for a, b in stukken:
        kaart.append({"bron": [round(a, 3), round(b, 3)], "nieuw": [round(t, 3), round(t + (b - a), 3)]})
        t += b - a
    pathlib.Path("analyse/cuts.json").write_text(json.dumps({"stukken": kaart, "duur": round(t, 3), "takes": cfg["takes"]}, indent=1))
    print(f"{len(stukken)} stukken, {t:.1f} s → public/speaker.mp4 en public/speaker.wav")


if __name__ == "__main__":
    main()
