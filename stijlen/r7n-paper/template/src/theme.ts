// R7N Paper: licht, warm papier. Donkere inkt, oranje accent, serif-kapitalen. Voor lijstjes en tools.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const kleur = {
  bg: "#f3eee4", // beige papier
  surface: "#fffdf8", // wit papier (kaarten)
  surface2: "#ece5d8",
  line: "#d8cfbf",
  text: "#17161a",
  muted: "#6f6861",
  accent: "#ff6a1a",
  accent2: "#b8420a", // donker oranje, leesbaar op licht
  ok: "#1f9d55",
  bad: "#d64545",
};

export const font = {
  sans: "Geist, system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
  serif: "'Instrument Serif', Georgia, serif",
};

// Lay-outs: waar de kaart, de spreker en de ondertitel staan (pixels op 1080×1920).
export type Layout = "hook" | "split" | "full" | "close" | "head" | "motion";
// head = korte tussenzin, spreker beeldvullend met push-in; motion = animatie over het hele scherm zonder spreker en zonder kader.
export const layout: Record<Layout, { kaart: { x: number; y: number; w: number; h: number }; spreker: { x: number; y: number; w: number; h: number; r: number } | "vol" | "weg"; ondertitelY: number }> = {
  hook: { kaart: { x: 90, y: 230, w: 900, h: 640 }, spreker: { x: 90, y: 1300, w: 900, h: 720, r: 36 }, ondertitelY: 1050 },
  split: { kaart: { x: 90, y: 200, w: 900, h: 740 }, spreker: { x: 90, y: 1300, w: 900, h: 720, r: 36 }, ondertitelY: 1040 },
  full: { kaart: { x: 90, y: 230, w: 900, h: 1060 }, spreker: "weg", ondertitelY: 1430 },
  close: { kaart: { x: 90, y: 230, w: 900, h: 640 }, spreker: "vol", ondertitelY: 1340 },
  head: { kaart: { x: 90, y: 230, w: 900, h: 640 }, spreker: "vol", ondertitelY: 1330 },
  motion: { kaart: { x: 60, y: 180, w: 960, h: 1180 }, spreker: "weg", ondertitelY: 1420 },
};

export const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// Eigenschappen die de gedeelde kaarten (cards/Extra.tsx) gebruiken om in deze stijl te passen.
export const stijl = { donker: false, serifCursief: false };
