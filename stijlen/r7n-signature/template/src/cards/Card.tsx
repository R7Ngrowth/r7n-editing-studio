// Alle soorten kaarten: afbeelding (met camera en markeringen), browser, terminal, teller, lijst, citaat en titel.
import { Img, staticFile } from "remotion";
import { ease, font, kleur } from "../theme";
import type { Camera, Kaart, Markeer, Regel } from "../types";
import { Extra, TerminalExtra, TerminalTeller } from "./Extra";
import { Frame, Pil, nlGetal } from "../ui";

const BASIS: Camera = { x: 0.5, y: 0.5, s: 1 };

function camera(t: number, van?: Camera, naar?: Camera, wissel?: number): Camera {
  const a = van ?? BASIS;
  if (!naar || wissel === undefined || t < wissel) return a;
  const p = ease((t - wissel) / 0.7);
  return { x: a.x + (naar.x - a.x) * p, y: a.y + (naar.y - a.y) * p, s: a.s + (naar.s - a.s) * p };
}

function Markeringen({ lijst, t }: { lijst?: Markeer[]; t: number }) {
  return (
    <>
      {(lijst ?? [])
        .filter((m) => t >= m.start)
        .map((m, i) => {
          const p = ease((t - m.start) / 0.3);
          return (
            <div key={i} style={{ position: "absolute", left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: `${m.w * 100}%`, height: `${m.h * 100}%`, opacity: p, transform: `scale(${1.15 - 0.15 * p})` }}>
              <div style={{ position: "absolute", inset: 0, border: `5px solid ${kleur.accent}`, borderRadius: 14, boxShadow: `0 0 0 6px ${kleur.accent}33, 0 0 40px ${kleur.accent}55` }} />
              {m.label && (
                <div style={{ position: "absolute", left: 0, top: "100%", marginTop: 14 }}>
                  <Pil>{m.label}</Pil>
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}

function Beeld({ src, t, van, naar, wissel, markeer, balk }: { src: string; t: number; van?: Camera; naar?: Camera; wissel?: number; markeer?: Markeer[]; balk?: string }) {
  const c = camera(t, van, naar, wissel);
  return (
    <Frame>
      {balk !== undefined && (
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: kleur.surface2, borderBottom: `1px solid ${kleur.line}` }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((k) => (
            <span key={k} style={{ width: 16, height: 16, borderRadius: 8, background: k }} />
          ))}
          <span style={{ marginLeft: 14, flex: 1, height: 36, borderRadius: 10, background: kleur.bg, color: kleur.muted, fontFamily: font.mono, fontSize: 20, display: "flex", alignItems: "center", padding: "0 14px" }}>{balk}</span>
        </div>
      )}
      <div style={{ position: "absolute", top: balk !== undefined ? 64 : 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${c.s})`, transformOrigin: `${c.x * 100}% ${c.y * 100}%` }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          <Markeringen lijst={markeer} t={t} />
        </div>
      </div>
    </Frame>
  );
}

function Terminal({ titel, regels, teller, t }: { titel?: string; regels: Regel[]; teller?: { label: string; tot: number; start: number; duur?: number }; t: number }) {
  const kleurVoor = { cmd: kleur.text, uit: kleur.muted, ok: kleur.ok, fout: kleur.bad, weg: kleur.bad, balk: kleur.muted };
  return (
    <Frame style={{ background: "#07080c" }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: kleur.surface2, borderBottom: `1px solid ${kleur.line}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((k) => (
          <span key={k} style={{ width: 16, height: 16, borderRadius: 8, background: k }} />
        ))}
        <span style={{ marginLeft: 14, color: kleur.muted, fontFamily: font.mono, fontSize: 20 }}>{titel ?? "terminal"}</span>
        <TerminalTeller teller={teller} t={t} />
      </div>
      <div style={{ padding: "26px 34px", fontFamily: font.mono, fontSize: 30, lineHeight: 1.55 }}>
        {regels
          .filter((r) => t >= r.start)
          .map((r, i) => {
            const soort = r.soort ?? "uit";
            if (soort === "weg" || soort === "balk")
              return (
                <div key={i} style={{ whiteSpace: "pre-wrap", opacity: Math.min(1, (t - r.start) / 0.12) }}>
                  <TerminalExtra r={r} t={t} kleurTekst={kleur.text} />
                </div>
              );
            const p = soort === "cmd" ? Math.min(1, (t - r.start) / 0.6) : 1;
            const tekst = r.t.slice(0, Math.ceil(r.t.length * p));
            return (
              <div key={i} style={{ color: kleurVoor[soort], whiteSpace: "pre-wrap", opacity: Math.min(1, (t - r.start) / 0.12) }}>
                {soort === "cmd" && <span style={{ color: kleur.accent }}>❯ </span>}
                {soort === "ok" && <span style={{ color: kleur.ok }}>✓ </span>}
                {soort === "fout" && <span style={{ color: kleur.bad }}>✗ </span>}
                {tekst}
                {soort === "cmd" && p < 1 && <span style={{ color: kleur.accent }}>▌</span>}
              </div>
            );
          })}
      </div>
    </Frame>
  );
}

function Counter({ label, tot, start, duur = 1.4, prefix = "", suffix = "", t }: { label: string; tot: number; start: number; duur?: number; prefix?: string; suffix?: string; t: number }) {
  const p = ease((t - start) / duur);
  const klaar = p >= 1;
  return (
    <Frame style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <Pil>{label}</Pil>
      <div
        style={{
          fontFamily: font.sans,
          fontWeight: 800,
          fontSize: 190,
          letterSpacing: -6,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: klaar ? "transparent" : kleur.text,
          background: klaar ? `linear-gradient(135deg, ${kleur.accent2}, ${kleur.accent})` : undefined,
          WebkitBackgroundClip: klaar ? "text" : undefined,
          backgroundClip: klaar ? "text" : undefined,
          transform: `scale(${klaar ? 1.04 : 1})`,
        }}
      >
        {prefix}
        {nlGetal(tot * p)}
        {suffix}
      </div>
    </Frame>
  );
}

function Lijst({ titel, items, t }: { titel?: string; items: { t: string; start: number; icoon?: string }[]; t: number }) {
  return (
    <Frame style={{ padding: "40px 44px", display: "flex", flexDirection: "column", gap: 20 }}>
      {titel && <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 64, color: kleur.text, marginBottom: 10 }}>{titel}</div>}
      {items.map((it, i) => {
        const p = ease((t - it.start) / 0.35);
        if (t < it.start) return null;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: `${kleur.accent}22`, border: `2px solid ${kleur.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: kleur.accent, fontFamily: font.serif, fontStyle: "italic" }}>
              {it.icoon ?? i + 1}
            </div>
            <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 44, color: kleur.text, lineHeight: 1.15 }}>{it.t}</div>
          </div>
        );
      })}
    </Frame>
  );
}

function Citaat({ tekst, door, start = 0, t }: { tekst: string; door?: string; start?: number; t: number }) {
  const p = ease((t - start) / 0.4);
  return (
    <Frame style={{ padding: "48px 52px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
      <div style={{ fontFamily: font.serif, fontSize: 150, lineHeight: 0.6, color: kleur.accent }}>“</div>
      <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 66, lineHeight: 1.15, color: kleur.text, opacity: p }}>{tekst}</div>
      {door && <div style={{ fontFamily: font.mono, fontSize: 24, letterSpacing: 2, textTransform: "uppercase", color: kleur.muted, opacity: p }}>— {door}</div>}
    </Frame>
  );
}

function Titel({ kop, sub, t }: { kop: string; sub?: string; t: number }) {
  const p = ease(t / 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "30px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
      <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 86, lineHeight: 1.02, letterSpacing: -2, color: kleur.text }}>{kop}</div>
      {sub && (
        <div style={{ overflow: "hidden" }}>
          <div style={{ display: "inline-block", transform: `translateX(${(1 - p) * -100}%)`, background: kleur.accent, color: "#0b0b0c", padding: "14px 28px", borderRadius: 18, fontFamily: font.serif, fontStyle: "italic", fontSize: 98, lineHeight: 1 }}>
            {sub}
          </div>
        </div>
      )}
    </div>
  );
}

export function Card({ kaart, t, sceneStart }: { kaart: Kaart; t: number; sceneStart: number }) {
  switch (kaart.type) {
    case "image":
      return <Beeld {...kaart} t={t} />;
    case "browser":
      return <Beeld {...kaart} balk={kaart.url} t={t} />;
    case "terminal":
      return <Terminal {...kaart} t={t} />;
    case "counter":
      return <Counter {...kaart} t={t} />;
    case "list":
      return <Lijst {...kaart} t={t} />;
    case "quote":
      return <Citaat {...kaart} t={t} />;
    case "title":
      return <Titel {...kaart} t={t - sceneStart} />;
    default:
      return <Extra kaart={kaart} t={t} sceneStart={sceneStart} />;
  }
}
