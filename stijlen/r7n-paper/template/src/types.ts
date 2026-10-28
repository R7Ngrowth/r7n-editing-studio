// De gegevens die een montage aanlevert in src/data/. Tijden zijn seconden in de gemonteerde video (speaker.mp4).
// Dit bestand is gelijk in alle R7N-stijlen: elke stijl tekent elke kaartsoort, in zijn eigen look.
import type { Layout } from "./theme";

export type Meta = {
  titel: string;
  fps: number;
  durationInFrames: number;
  // Waar het gezicht van de spreker zit in de bron (0–1 van breedte en hoogte) en hoe ver we inzoomen in de box en bij head/close.
  spreker: { focus: [number, number]; zoomBox: number; zoomClose: number; alpha: boolean };
  // Geluidseffecten (whoosh bij een nieuwe scène, pop bij lijstpunten, tick/ding bij tellers). Standaard aan, op 20%.
  geluid?: boolean;
};

export type Woord = { t: string; start: number; eind: number; accent?: boolean };
export type Groep = { start: number; eind: number; woorden: Woord[] };
export type Captions = { groepen: Groep[]; cta?: { start: number; regel: string; trefwoord: string } };

// Camera op een afbeelding: middelpunt (0–1) en schaal. `wissel` = seconde waarop van `van` naar `naar` wordt bewogen.
export type Camera = { x: number; y: number; s: number };
export type Markeer = { x: number; y: number; w: number; h: number; start: number; label?: string };
export type Regel = { t: string; start: number; soort?: "cmd" | "uit" | "ok" | "fout" | "weg" | "balk"; waarde?: number };

export type Kaart =
  | { type: "none" }
  // --- basis ---
  | { type: "image"; src: string; van?: Camera; naar?: Camera; wissel?: number; markeer?: Markeer[] }
  | { type: "browser"; src: string; url: string; van?: Camera; naar?: Camera; wissel?: number; markeer?: Markeer[] }
  | { type: "terminal"; titel?: string; regels: Regel[]; teller?: { label: string; tot: number; start: number; duur?: number } }
  | { type: "counter"; label: string; tot: number; start: number; duur?: number; suffix?: string; prefix?: string }
  | { type: "list"; titel?: string; items: { t: string; start: number; icoon?: string }[] }
  | { type: "quote"; tekst: string; door?: string; start?: number }
  | { type: "title"; kop: string; sub?: string }
  // --- social en apparaten ---
  | { type: "tweet"; naam: string; handle: string; tekst: string; tijd?: string; markeer?: { zin: string; start: number }[]; kader?: { zin: string; start: number } }
  | { type: "device"; soort: "tv" | "laptop" | "telefoon"; schermen: { src: string; start: number }[]; pil?: { tekst: string; start: number } }
  // --- app-animaties ---
  | { type: "keys"; titel?: string; toetsen: { t: string; start: number }[] }
  | { type: "mail"; van: string; onderwerp: string; tekst: string; antwoord?: { tekst: string; start: number } }
  | { type: "checklist"; titel: string; items: { t: string; start: number; af?: number }[]; iconen?: { naam: string; kleur?: string; start: number; slot?: number }[] }
  | { type: "voice"; status: string; tekst?: string; start: number; klaar?: number }
  | { type: "ring"; naam: string; start: number; toetsen?: string[] }
  // --- motion graphics ---
  | { type: "logos"; logos: { naam: string; kleur?: string; start: number; weg?: number }[]; getal?: { waarde: number; prefix?: string; suffix?: string; label?: string; start: number; duur?: number; rood?: number } }
  | { type: "ranking"; titel?: string; items: { nr: number; t: string; start: number; delta?: string; licht?: number; weg?: number }[] }
  | { type: "headline"; regels: { t: string; accent?: boolean }[]; start: number; icoon?: "zoek" | "ster" | "pijl" | "vink" }
  | { type: "pixel"; label?: string; tekst: string; start: number; icoon?: string; sub?: string }
  | { type: "toggle"; naam: string; van?: string; naar?: string; start: number }
  | { type: "installer"; titel: string; start: number; duur?: number; stappen?: { t: string; start: number }[] };

export type Scene = { start: number; layout: Layout; kaart: Kaart };
