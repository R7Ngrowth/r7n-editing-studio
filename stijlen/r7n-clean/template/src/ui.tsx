// Bouwstenen van R7N Clean: witte kaart met zachte, brede schaduw, zonder harde rand.
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
        borderRadius: 44,
        background: kleur.surface,
        boxShadow: "0 1px 0 rgba(11,12,18,.04), 0 30px 90px rgba(20,30,80,.14), 0 8px 24px rgba(20,30,80,.06)",
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
        padding: "9px 18px",
        borderRadius: 999,
        background: `${kleurTekst}14`,
        color: kleurTekst,
        fontFamily: font.sans,
        fontWeight: 600,
        fontSize: 24,
      }}
    >
      {children}
    </span>
  );
}

export const nlGetal = (n: number) => new Intl.NumberFormat("nl-NL").format(Math.round(n));
