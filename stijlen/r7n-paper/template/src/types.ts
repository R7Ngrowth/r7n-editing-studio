// De gegevens die een montage aanlevert in src/data/. Tijden zijn seconden in de gemonteerde video (speaker.mp4).
import type { Layout } from "./theme";

export type Meta = {
  titel: string;
  fps: number;
  durationInFrames: number;
  // Waar het gezicht van de spreker zit in de bron (0–1 van breedte en hoogte) en hoe ver we inzoomen in de box en bij de afsluiter.
  spreker: { focus: [number, number]; zoomBox: number; zoomClose: number; alpha: boolean };
};

export type Woord = { t: string; start: number; eind: number; accent?: boolean };
export type Groep = { start: number; eind: number; woorden: Woord[] };
export type Captions = { groepen: Groep[]; cta?: { start: number; regel: string; trefwoord: string } };

export type Kaart =
  | { type: "none" }
  | { type: "image"; src: string; van?: Camera; naar?: Camera; wissel?: number; markeer?: Markeer[] }
  | { type: "browser"; src: string; url: string; van?: Camera; naar?: Camera; wissel?: number; markeer?: Markeer[] }
  | { type: "terminal"; titel?: string; regels: { t: string; start: number; soort?: "cmd" | "uit" | "ok" | "fout" }[] }
  | { type: "counter"; label: string; tot: number; start: number; duur?: number; suffix?: string; prefix?: string }
  | { type: "list"; titel?: string; items: { t: string; start: number; icoon?: string }[] }
  | { type: "quote"; tekst: string; door?: string; start?: number }
  | { type: "title"; kop: string; sub?: string };

// Camera op een afbeelding: middelpunt (0–1) en schaal. `wissel` = seconde waarop van `van` naar `naar` wordt bewogen.
export type Camera = { x: number; y: number; s: number };
export type Markeer = { x: number; y: number; w: number; h: number; start: number; label?: string };

export type Scene = { start: number; layout: Layout; kaart: Kaart };
