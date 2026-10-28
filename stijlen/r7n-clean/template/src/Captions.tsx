// Ondertitels van R7N Clean: wit over de video (split/hook/close), donker op wit bij `full`. Accent in blauw, cursieve serif.
import { ease, font, kleur } from "./theme";
import type { Captions as CaptionsData } from "./types";

export function Captions({ data, t, y, donker }: { data: CaptionsData; t: number; y: number; donker: boolean }) {
  const inkt = donker ? "#ffffff" : kleur.text;
  const schaduw = donker ? "0 3px 22px rgba(0,0,0,.6)" : "none";
  const cta = data.cta && t >= data.cta.start ? data.cta : null;
  if (cta) {
    const p = ease((t - cta.start) / 0.35);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 80, textAlign: "center", opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
        <div style={{ fontFamily: font.sans, fontWeight: 500, fontSize: 64, color: inkt, textShadow: schaduw }}>{cta.regel}</div>
        <div style={{ display: "inline-block", marginTop: 18, padding: "18px 54px", borderRadius: 999, background: kleur.accent, color: "#fff", fontFamily: font.sans, fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: -3, boxShadow: `0 20px 60px ${kleur.accent}66` }}>{cta.trefwoord}</div>
      </div>
    );
  }

  const groep = data.groepen.find((g) => t >= g.start - 0.02 && t < g.eind + 0.25);
  if (!groep) return null;
  const zichtbaar = groep.woorden.filter((w) => t >= w.start - 0.03);
  if (!zichtbaar.length) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", justifyContent: "center", alignItems: "baseline", flexWrap: "wrap", gap: "0 20px", textAlign: "center" }}>
      {zichtbaar.map((w, i) => {
        const p = ease((t - w.start + 0.03) / 0.14);
        const basis = { display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: `blur(${(1 - p) * 8}px)`, textShadow: schaduw } as const;
        return w.accent ? (
          <span key={i} style={{ ...basis, fontFamily: font.serif, fontStyle: "italic", fontSize: 96, lineHeight: 1, color: donker ? "#9fb0ff" : kleur.accent2 }}>
            {w.t}
          </span>
        ) : (
          <span key={i} style={{ ...basis, fontFamily: font.sans, fontWeight: 700, fontSize: 76, lineHeight: 1.05, color: inkt, letterSpacing: -1.5 }}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
}
