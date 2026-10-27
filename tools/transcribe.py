#!/usr/bin/env python3
"""Spraak naar tekst met woordtijden, lokaal op Apple Silicon (mlx-whisper, whisper-large-v3-turbo).

Gebruik:  uv run --with mlx-whisper python transcribe.py opname.wav [--taal nl] [--termen "Claude Code, GitHub"]
Schrijft naast het geluidsbestand een .json met:
  {"taal": "nl", "segmenten": [{"start", "eind", "tekst"}], "woorden": [{"woord", "start", "eind", "kans"}]}
en drukt de segmenten af. Vaktermen helpen het model namen goed te schrijven.
"""
import argparse
import json
import pathlib
import sys

import mlx_whisper

MODEL = "mlx-community/whisper-large-v3-turbo"


def transcribeer(pad: str, taal: str, termen: str) -> dict:
    r = mlx_whisper.transcribe(
        pad,
        path_or_hf_repo=MODEL,
        language=taal or None,
        word_timestamps=True,
        condition_on_previous_text=False,
        initial_prompt=termen or None,
    )
    segmenten, woorden = [], []
    for s in r.get("segments", []):
        tekst = s.get("text", "").strip()
        if not tekst:
            continue
        segmenten.append({"start": round(s["start"], 3), "eind": round(s["end"], 3), "tekst": tekst})
        for w in s.get("words", []):
            woorden.append({"woord": w["word"].strip(), "start": round(w["start"], 3), "eind": round(w["end"], 3), "kans": round(float(w.get("probability", 0)), 3)})
    return {"taal": r.get("language", taal), "segmenten": segmenten, "woorden": woorden}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("bestanden", nargs="+")
    ap.add_argument("--taal", default="nl")
    ap.add_argument("--termen", default="")
    a = ap.parse_args()
    for f in a.bestanden:
        uit = transcribeer(f, a.taal, a.termen)
        pathlib.Path(f).with_suffix(".json").write_text(json.dumps(uit, ensure_ascii=False, indent=1))
        print(f"== {f}: {len(uit['segmenten'])} segmenten, {len(uit['woorden'])} woorden", file=sys.stderr)
        for s in uit["segmenten"]:
            print(f"[{s['start']:.1f}–{s['eind']:.1f}] {s['tekst']}", flush=True)


if __name__ == "__main__":
    main()
