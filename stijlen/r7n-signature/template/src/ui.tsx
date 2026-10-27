// Bouwstenen: het kader om elke kaart, en de binnenkomst-animatie.
import type { CSSProperties, ReactNode } from "react";
import { ease, kleur } from "./theme";

/** Kaart komt binnen: omhoog, iets groter en scherper, in 0,3 s vanaf `vanaf` (seconden) */
export function binnenkomst(t: number, vanaf: number, duur = 0.3): CSSProperties {
  const p = ease((t - vanaf) / duur);
  return { opacity: p, transform: `translateY(${(1 - p) * 60}px) scale(${0.94 + 0.06 * p})`, filter: `blur(${(1 - p) * 12}px)` };
}

export function Frame({ children, style, glow = true }: { children: ReactNode; style?: CSSProperties; glow?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 28,
        background: kleur.surface,
        border: `2px solid ${kleur.line}`,
        boxShadow: glow ? `0 0 0 1px rgba(255,106,26,.18), 0 30px 80px rgba(0,0,0,.55), 0 0 120px rgba(255,106,26,.10)` : "0 30px 80px rgba(0,0,0,.55)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Pil({ children, kleurTekst = kleur.accent }: { children: ReactNode; kleurTekst?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        borderRadius: 999,
        border: `2px solid ${kleurTekst}44`,
        background: `${kleurTekst}1a`,
        color: kleurTekst,
        fontFamily: "'Geist Mono', monospace",
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
