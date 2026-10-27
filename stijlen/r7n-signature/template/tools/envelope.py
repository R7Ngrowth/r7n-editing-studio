#!/usr/bin/env python3
"""Waar wordt gesproken en waar valt het stil? Helpt bij het vinden van takes die whisper samenvoegde of oversloeg.

Gebruik:  uv run --with numpy python tools/envelope.py analyse/opname.wav [--min-stilte 0.5]
Schrijft analyse/spraak.json ({"stukken": [{"start","eind","duur"}]}) en drukt de stukken af.
Het wav maak je met:  ffmpeg -i <bron> -vn -ac 1 -ar 16000 analyse/opname.wav
"""
import argparse
import json
import pathlib

from geluid import energie_db, laad, spraak_stukken


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("wav")
    ap.add_argument("--min-stilte", type=float, default=0.5, help="stilte die als grens tussen stukken telt (s)")
    a = ap.parse_args()
    data, sr = laad(a.wav)
    db = energie_db(data, sr)
    stukken = spraak_stukken(db, min_stilte=a.min_stilte)
    uit = {"stukken": [{"start": round(s, 2), "eind": round(e, 2), "duur": round(e - s, 2)} for s, e in stukken]}
    doel = pathlib.Path(a.wav).with_name("spraak.json")
    doel.write_text(json.dumps(uit, indent=1))
    for s in uit["stukken"]:
        print(f"{s['start']:7.2f} – {s['eind']:7.2f}  ({s['duur']:.2f} s)")
    print(f"{len(stukken)} stukken → {doel}")


if __name__ == "__main__":
    main()
