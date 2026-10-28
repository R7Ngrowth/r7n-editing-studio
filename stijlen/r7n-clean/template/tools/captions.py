#!/usr/bin/env python3
"""Van een leesbare ondertitelopzet naar src/data/captions.json met echte woordtijden.

Gebruik:  python3 tools/captions.py captions.txt public/speaker.json
captions.txt, één groep per regel (1 tot 3 woorden per groep werkt het best):
    dit is | een *testopname*          # `|` splitst een regel in meerdere groepen
    voor R7N=R7N | Editing Studio       # weergave=gehoord: zo schrijf je het, zo verstond whisper het
    reageer met | *STUDIO*
    >> reageer met *STUDIO*             # `>>` = afsluiter: blijft staan tot het einde, accentwoord wordt het trefwoord
    ChatGPT=Chat+GPT                    # `+` plakt woorden die whisper los schreef
Accent: *woord*. Regels met # zijn commentaar. Woorden worden op volgorde gekoppeld aan de woordtijden; bij een
afwijking zoekt het script vooruit (max 4 woorden) op gelijkenis. Niet-gevonden woorden krijgen de tijd van hun buur
en komen in de melding onderaan, zodat je ze kunt nalopen.
"""
from __future__ import annotations

import difflib
import json
import re
import sys

NORM = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


def main() -> None:
    spec_pad, woorden_pad = sys.argv[1], sys.argv[2]
    gehoord = json.load(open(woorden_pad))["woorden"]
    tokens = [NORM(w["woord"]) for w in gehoord]
    pos = 0
    groepen, cta, twijfel = [], None, []

    def koppel(gezocht: str) -> tuple[float, float]:
        """Zoek het woord vanaf `pos`, maximaal 4 posities vooruit; geeft (start, eind)."""
        nonlocal pos
        delen = [NORM(d) for d in gezocht.split("+")]
        beste, beste_i = 0.0, -1
        for i in range(pos, min(len(tokens), pos + 5)):
            kandidaat = "".join(tokens[i : i + len(delen)])
            r = difflib.SequenceMatcher(None, "".join(delen), kandidaat).ratio()
            if r > beste:
                beste, beste_i = r, i
            if r > 0.92:
                break
        if beste_i < 0 or beste < 0.55:
            twijfel.append(gezocht)
            w = gehoord[min(pos, len(gehoord) - 1)]
            return w["start"], w["eind"]
        pos = beste_i + len(delen)
        return gehoord[beste_i]["start"], gehoord[min(pos, len(gehoord)) - 1]["eind"]

    for regel in open(spec_pad, encoding="utf-8"):
        regel = regel.split("#")[0].strip()
        if not regel:
            continue
        is_cta = regel.startswith(">>")
        regel = regel.lstrip(">").strip()
        for groep in [g.strip() for g in regel.split("|") if g.strip()]:
            woorden = []
            for tok in groep.split():
                accent = tok.startswith("*") and tok.endswith("*") and len(tok) > 2
                tok = tok.strip("*")
                weergave, _, gehoord_als = tok.partition("=")
                start, eind = koppel(gehoord_als or weergave)
                woorden.append({"t": weergave, "start": round(start, 3), "eind": round(eind, 3), "accent": accent})
            if not woorden:
                continue
            if is_cta:
                accenten = [w["t"] for w in woorden if w["accent"]]
                cta = {"start": woorden[0]["start"], "regel": " ".join(w["t"] for w in woorden if not w["accent"]), "trefwoord": (accenten[0] if accenten else woorden[-1]["t"]).upper()}
            else:
                groepen.append({"start": woorden[0]["start"], "eind": woorden[-1]["eind"], "woorden": woorden})

    uit = {"groepen": groepen}
    if cta:
        uit["cta"] = cta
    json.dump(uit, open("src/data/captions.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(groepen)} groepen" + (", met afsluiter" if cta else "") + f" → src/data/captions.json")
    if twijfel:
        print("NIET GEVONDEN (tijd van de buur gebruikt, controleer): " + ", ".join(twijfel))


if __name__ == "__main__":
    main()
