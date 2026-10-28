// Lettertypen uit public/fonts laden voordat het eerste frame wordt getekend (Geist, Geist Mono, Instrument Serif; alle OFL).
import { continueRender, delayRender, staticFile } from "remotion";

const LIJST: [string, string, string][] = [
  ["Geist", "fonts/Geist.ttf", "normal"],
  ["Geist Mono", "fonts/GeistMono.ttf", "normal"],
  ["Instrument Serif", "fonts/InstrumentSerif-Italic.ttf", "italic"],
  ["Instrument Serif", "fonts/InstrumentSerif-Regular.ttf", "normal"],
  ["Jersey 10", "fonts/Jersey10-Regular.ttf", "normal"],
];

let gestart = false;
export function laadFonts() {
  if (gestart || typeof document === "undefined") return;
  gestart = true;
  const wacht = delayRender("fonts");
  Promise.all(
    LIJST.map(async ([naam, pad, stijl]) => {
      const f = new FontFace(naam, `url(${staticFile(pad)})`, { style: stijl, weight: "100 900" });
      await f.load();
      document.fonts.add(f);
    }),
  )
    .catch((e) => console.warn("font niet geladen", e))
    .finally(() => continueRender(wacht));
}
