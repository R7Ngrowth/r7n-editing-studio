// Kleuren, letters en maten van R7N Signature. Eén plek: verander hier en de hele reel past mee.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const kleur = {
  bg: "#06070a",
  surface: "#0b0d12",
  surface2: "#11141c",
  line: "#242938",
  text: "#f2f3f7",
  muted: "#9aa1b4",
  accent: "#ff6a1a",
  accent2: "#ffb27a",
  ok: "#3ecf8e",
  bad: "#ff5d5d",
};

export const font = {
  sans: "Geist, system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
  serif: "'Instrument Serif', Georgia, serif",
};

// Lay-outs: waar de kaart, de spreker en de ondertitel staan (pixels op 1080×1920).
export type Layout = "hook" | "split" | "full" | "close";
export const layout: Record<Layout, { kaart: { x: number; y: number; w: number; h: number }; spreker: { x: number; y: number; w: number; h: number; r: number } | "vol" | "weg"; ondertitelY: number }> = {
  hook: { kaart: { x: 90, y: 250, w: 900, h: 620 }, spreker: { x: 76, y: 1300, w: 928, h: 720, r: 80 }, ondertitelY: 1050 },
  split: { kaart: { x: 90, y: 220, w: 900, h: 720 }, spreker: { x: 76, y: 1300, w: 928, h: 720, r: 80 }, ondertitelY: 1040 },
  full: { kaart: { x: 90, y: 250, w: 900, h: 1040 }, spreker: "weg", ondertitelY: 1430 },
  close: { kaart: { x: 90, y: 250, w: 900, h: 620 }, spreker: "vol", ondertitelY: 1340 },
};

export const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3); // snel starten, zacht landen
