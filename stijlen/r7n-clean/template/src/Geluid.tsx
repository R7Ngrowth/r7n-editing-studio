// Geluidseffecten, automatisch afgeleid van de scènes: whoosh bij elke nieuwe scène, pop bij lijstpunten, logo's, toetsen
// en markeringen, tick + ding bij tellers, impact bij een grote kop. Eigen gesynthetiseerde geluiden (public/sfx), op 20%.
// Uitzetten: "geluid": false in src/data/meta.json.
import { Audio, Sequence, staticFile } from "remotion";
import type { Kaart, Scene } from "./types";

const NIVEAU = 0.2;
type Naam = "whoosh" | "pop" | "tick" | "ding" | "impact" | "paper" | "click";
type Moment = { t: number; naam: Naam; niveau?: number };

function momenten(k: Kaart): Moment[] {
  switch (k.type) {
    case "list":
      return k.items.map((i) => ({ t: i.start, naam: "pop" }));
    case "image":
    case "browser":
      return (k.markeer ?? []).map((m) => ({ t: m.start, naam: "pop" }));
    case "terminal":
      return k.regels.filter((r) => r.soort === "ok" || r.soort === "weg").map((r) => ({ t: r.start, naam: "tick", niveau: 0.6 }));
    case "counter":
      return [{ t: k.start + (k.duur ?? 1.4), naam: "ding" }];
    case "tweet":
      return [...(k.markeer ?? []), ...(k.kader ? [k.kader] : [])].map((m) => ({ t: m.start, naam: "pop" }));
    case "device":
      return k.schermen.slice(1).map((s) => ({ t: s.start, naam: "click" }));
    case "keys":
      return k.toetsen.map((x) => ({ t: x.start, naam: "click", niveau: 1.4 }));
    case "checklist":
      return [...k.items.filter((i) => i.af !== undefined).map((i) => ({ t: i.af as number, naam: "tick" as Naam })), ...(k.iconen ?? []).map((i) => ({ t: i.start, naam: "pop" as Naam }))];
    case "logos":
      return [...k.logos.map((l) => ({ t: l.start, naam: "pop" as Naam })), ...(k.getal ? [{ t: k.getal.start + (k.getal.duur ?? 1.4), naam: "ding" as Naam }] : [])];
    case "ranking":
      return k.items.filter((i) => i.licht !== undefined).map((i) => ({ t: i.licht as number, naam: "pop" }));
    case "headline":
      return [{ t: k.start, naam: "impact", niveau: 0.8 }];
    case "pixel":
      return [{ t: k.start, naam: "pop" }];
    case "toggle":
      return [{ t: k.start, naam: "click", niveau: 1.4 }, { t: k.start + 0.3, naam: "ding", niveau: 0.6 }];
    case "installer":
      return [{ t: k.start, naam: "paper" }, { t: k.start + (k.duur ?? 2.2), naam: "ding" }];
    default:
      return [];
  }
}

export function Geluid({ scenes, fps, aan = true }: { scenes: Scene[]; fps: number; aan?: boolean }) {
  if (!aan) return null;
  const lijst: Moment[] = [];
  scenes.forEach((s, i) => {
    if (i > 0) lijst.push({ t: s.start, naam: "whoosh" });
    lijst.push(...momenten(s.kaart));
  });
  return (
    <>
      {lijst
        .filter((m) => m.t >= 0)
        .map((m, i) => (
          <Sequence key={i} from={Math.round(m.t * fps)} durationInFrames={Math.round(fps * 1.2)} layout="none">
            <Audio src={staticFile(`sfx/${m.naam}.wav`)} volume={NIVEAU * (m.niveau ?? 1)} />
          </Sequence>
        ))}
    </>
  );
}
