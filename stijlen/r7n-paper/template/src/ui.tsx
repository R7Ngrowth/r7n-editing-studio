// Bouwstenen van R7N Paper: een papieren kaart met zachte schaduw en een dun potloodlijntje, labels in mono-kapitalen.
import type { CSSProperties, ReactNode } from "react";
import { ease, font, kleur } from "./theme";

export function binnenkomst(t: number, vanaf: number, duur = 0.3): CSSProperties {
  const p = ease((t - vanaf) / duur);
  return { opacity: p, transform: `translateY(${(1 - p) * 60}px) scale(${0.94 + 0.06 * p})`, filter: `blur(${(1 - p) * 12}px)` };
}

export function Frame({ children, style }: { children: ReactNode; style?: CSSProperties; glow?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 30,
        background: kleur.surface,
        border: `1.5px solid ${kleur.line}`,
        boxShadow: "0 2px 0 rgba(23,22,26,.06), 0 24px 60px rgba(60,40,10,.14)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Pil({ children, kleurTekst = kleur.accent2 }: { children: ReactNode; kleurTekst?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        borderRadius: 10,
        border: `1.5px solid ${kleurTekst}55`,
        background: `${kleurTekst}12`,
        color: kleurTekst,
        fontFamily: font.mono,
        fontSize: 22,
        letterSpacing: 2,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

export const nlGetal = (n: number) => new Intl.NumberFormat("nl-NL").format(Math.round(n));
