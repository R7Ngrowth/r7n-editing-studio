// Ondertitels: groepen van 1–3 woorden, woord voor woord zichtbaar op het moment dat het wordt uitgesproken.
// Accenten in cursieve serif met oranje verloop. De afsluiter ("reageer met …") blijft staan tot het einde.
import { ease, font, kleur } from "./theme";
import type { Captions as CaptionsData } from "./types";

export function Captions({ data, t, y, donker }: { data: CaptionsData; t: number; y: number; donker: boolean }) {
  const cta = data.cta && t >= data.cta.start ? data.cta : null;
  if (cta) {
    const p = ease((t - cta.start) / 0.35);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 80, textAlign: "center", opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
        <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 72, color: kleur.text, textShadow: "0 4px 30px rgba(0,0,0,.6)" }}>{cta.regel}</div>
        <div
          style={{
            fontFamily: font.serif,
            fontStyle: "italic",
            fontSize: 190,
            lineHeight: 1,
            marginTop: 10,
            color: kleur.accent,
            textShadow: `0 0 60px ${kleur.accent}99, 0 0 140px ${kleur.accent}55`,
          }}
        >
          {cta.trefwoord}
        </div>
      </div>
    );
  }

  const groep = data.groepen.find((g) => t >= g.start - 0.02 && t < g.eind + 0.25);
  if (!groep) return null;
  const zichtbaar = groep.woorden.filter((w) => t >= w.start - 0.03);
  if (!zichtbaar.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: "0 22px",
        textAlign: "center",
      }}
    >
      {zichtbaar.map((w, i) => {
        const p = ease((t - w.start + 0.03) / 0.14);
        const basis = {
          display: "inline-block",
          opacity: p,
          transform: `translateY(${(1 - p) * 14}px)`,
          filter: `blur(${(1 - p) * 8}px)`,
          textShadow: donker ? "0 4px 24px rgba(0,0,0,.7)" : "0 2px 18px rgba(0,0,0,.35)",
        } as const;
        return w.accent ? (
          <span
            key={i}
            style={{
              ...basis,
              fontFamily: font.serif,
              fontStyle: "italic",
              fontSize: 98,
              lineHeight: 1,
              background: `linear-gradient(135deg, ${kleur.accent2}, ${kleur.accent})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: `blur(${(1 - p) * 8}px) drop-shadow(0 0 24px ${kleur.accent}66)`,
            }}
          >
            {w.t}
          </span>
        ) : (
          <span key={i} style={{ ...basis, fontFamily: font.sans, fontWeight: 700, fontSize: 80, lineHeight: 1.05, color: kleur.text, letterSpacing: -1 }}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
}
