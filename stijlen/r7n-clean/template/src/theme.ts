// R7N Clean: wit, luchtig, één blauw accent. 50/50-split: kaart boven, spreker onder op gelijke hoogte. Voor apps en productiviteit.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const kleur = {
  bg: "#ffffff",
  surface: "#ffffff",
  surface2: "#f1f3f8",
  line: "#e2e5ee",
  text: "#0b0c12",
  muted: "#6e7385",
  accent: "#5b74ff",
  accent2: "#3b55e6",
  ok: "#1f9d55",
  bad: "#e0474c",
};

export const font = {
  sans: "Geist, system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
  serif: "'Instrument Serif', Georgia, serif",
};

// Lay-outs (pixels op 1080×1920). split = 50/50: kaart y140–940, spreker y1000–1800. Ondertitel over het onderste deel.
export type Layout = "hook" | "split" | "full" | "close" | "head" | "motion";
// head = korte tussenzin, spreker beeldvullend met push-in; motion = animatie over het hele scherm zonder spreker en zonder kader.
export const layout: Record<Layout, { kaart: { x: number; y: number; w: number; h: number }; spreker: { x: number; y: number; w: number; h: number; r: number } | "vol" | "weg"; ondertitelY: number }> = {
  hook: { kaart: { x: 80, y: 140, w: 920, h: 800 }, spreker: { x: 80, y: 1000, w: 920, h: 800, r: 56 }, ondertitelY: 1640 },
  split: { kaart: { x: 80, y: 140, w: 920, h: 800 }, spreker: { x: 80, y: 1000, w: 920, h: 800, r: 56 }, ondertitelY: 1640 },
  full: { kaart: { x: 80, y: 140, w: 920, h: 1300 }, spreker: "weg", ondertitelY: 1560 },
  close: { kaart: { x: 80, y: 140, w: 920, h: 800 }, spreker: "vol", ondertitelY: 1340 },
  head: { kaart: { x: 80, y: 140, w: 920, h: 800 }, spreker: "vol", ondertitelY: 1180 },
  motion: { kaart: { x: 60, y: 150, w: 960, h: 1000 }, spreker: "weg", ondertitelY: 1250 },
};

export const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// Eigenschappen die de gedeelde kaarten (cards/Extra.tsx) gebruiken om in deze stijl te passen.
export const stijl = { donker: false, serifCursief: false };
