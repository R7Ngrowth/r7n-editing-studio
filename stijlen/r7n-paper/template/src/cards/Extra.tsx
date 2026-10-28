// Extra kaarten, gelijk in alle R7N-stijlen. Ze nemen kleuren, letters en kaartvorm over uit theme.ts en ui.tsx van de stijl.
// tweet · device · keys · mail · checklist · voice · ring · logos · ranking · headline · pixel · toggle · installer
import type { CSSProperties, ReactNode } from "react";
import { Img, staticFile } from "remotion";
import { ease, font, kleur, stijl } from "../theme";
import type { Kaart } from "../types";
import { Frame, Pil, nlGetal } from "../ui";

const klem = (x: number) => Math.min(1, Math.max(0, x));
const p = (t: number, start: number, duur = 0.35) => ease((t - start) / duur);
const getypt = (tekst: string, t: number, start: number, perTeken = 0.035) => tekst.slice(0, Math.max(0, Math.floor((t - start) / perTeken)));
const opkomst = (t: number, start: number, afstand = 40): CSSProperties => {
  const q = p(t, start, 0.35);
  return { opacity: q, transform: `translateY(${(1 - q) * afstand}px) scale(${0.94 + 0.06 * q})`, filter: `blur(${(1 - q) * 10}px)` };
};
const vul = { position: "absolute", inset: 0 } as const;

// ---------- kleine bouwstenen ----------
export function Keycap({ t, start, tekst, breed = false }: { t: number; start: number; tekst: string; breed?: boolean }) {
  const d = t - start;
  const druk = d >= 0 && d < 0.16 ? Math.sin((d / 0.16) * Math.PI) : 0;
  const rimpel = d >= 0 && d < 0.6 ? d / 0.6 : 0;
  const zicht = p(t, start - 0.25, 0.3);
  return (
    <div style={{ position: "relative", opacity: zicht, transform: `translateY(${(1 - zicht) * 20}px)` }}>
      {rimpel > 0 && (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 260, height: 260, marginLeft: -130, marginTop: -130, borderRadius: "50%", border: `4px solid ${kleur.accent}`, opacity: 1 - rimpel, transform: `scale(${0.3 + rimpel})` }} />
      )}
      <div
        style={{
          minWidth: breed ? 260 : 150,
          height: 130,
          padding: "0 30px",
          borderRadius: 26,
          background: "linear-gradient(180deg, #ffffff, #eef0f5)",
          boxShadow: `0 ${10 - 8 * druk}px 0 #c9ced9, 0 ${22 - 14 * druk}px 40px rgba(20,30,60,.22)`,
          transform: `translateY(${8 * druk}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: font.sans,
          fontWeight: 600,
          fontSize: 40,
          color: "#1b1d26",
        }}
      >
        {tekst}
      </div>
    </div>
  );
}

function AppTegel({ naam, kleurTegel, t, start, slot }: { naam: string; kleurTegel?: string; t: number; start: number; slot?: number }) {
  const op = slot !== undefined && t >= slot ? p(t, slot, 0.3) : 0;
  return (
    <div style={{ position: "relative", width: 120, height: 120, borderRadius: 30, background: "#fff", boxShadow: "0 14px 34px rgba(20,30,60,.18)", display: "flex", alignItems: "center", justifyContent: "center", ...opkomst(t, start, 30) }}>
      <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 50, color: kleurTegel ?? kleur.accent, filter: `grayscale(${op})`, opacity: 1 - 0.55 * op }}>{naam.length <= 2 ? naam : naam[0].toUpperCase()}</span>
      {op > 0 && (
        <div style={{ position: "absolute", right: -10, bottom: -10, width: 52, height: 52, borderRadius: 26, background: "#1b1d26", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, transform: `scale(${op})` }}>🔒</div>
      )}
    </div>
  );
}

// Rollende cijfers met een lichte bewegingsonscherpte; elke positie rolt naar zijn eindcijfer.
export function Odometer({ waarde, t, start, duur = 1.6, hoogte = 200, kleurTekst = kleur.text, fam = font.sans, gewicht = 800 }: { waarde: number; t: number; start: number; duur?: number; hoogte?: number; kleurTekst?: string; fam?: string; gewicht?: number }) {
  const tekst = nlGetal(waarde);
  const n = tekst.replace(/\D/g, "").length;
  let k = 0;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", height: hoogte, overflow: "hidden" }}>
      {tekst.split("").map((c, i) => {
        if (!/\d/.test(c))
          return (
            <span key={i} style={{ fontFamily: fam, fontWeight: gewicht, fontSize: hoogte, lineHeight: `${hoogte}px`, color: kleurTekst }}>
              {c}
            </span>
          );
        const idx = k++;
        const eigen = ease(klem(((t - start) / duur) * (1 + 0.3 * (n - 1)) - 0.3 * idx));
        const stand = (Number(c) + 10) * eigen; // een extra rondje
        const snelheid = eigen > 0 && eigen < 1 ? 6 : 0;
        return (
          <span key={i} style={{ display: "inline-block", height: hoogte, overflow: "hidden", width: hoogte * 0.6 }}>
            <span style={{ display: "block", transform: `translateY(${-stand * hoogte}px)`, filter: `blur(${snelheid}px)` }}>
              {Array.from({ length: 21 }, (_, d) => (
                <span key={d} style={{ display: "block", height: hoogte, lineHeight: `${hoogte}px`, textAlign: "center", fontFamily: fam, fontWeight: gewicht, fontSize: hoogte, color: kleurTekst }}>
                  {d % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function Golf({ t, kleurGolf = kleur.accent, balken = 28, hoogte = 90 }: { t: number; kleurGolf?: string; balken?: number; hoogte?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, height: hoogte }}>
      {Array.from({ length: balken }, (_, i) => {
        const h = 0.2 + 0.8 * Math.abs(Math.sin(t * 7 + i * 0.7) * Math.sin(t * 2.3 + i * 0.31));
        return <span key={i} style={{ width: 9, height: hoogte * h, borderRadius: 5, background: kleurGolf, opacity: 0.55 + 0.45 * h }} />;
      })}
    </div>
  );
}

function Icoon({ soort, t, start }: { soort: "zoek" | "ster" | "pijl" | "vink"; t: number; start: number }) {
  const q = p(t, start, 0.6);
  const lijn = kleur.accent;
  if (soort === "zoek")
    return (
      <svg width="170" height="170" viewBox="0 0 100 100">
        <circle cx="42" cy="42" r="26" fill="none" stroke={lijn} strokeWidth="8" strokeDasharray="164" strokeDashoffset={164 * (1 - q)} strokeLinecap="round" />
        <line x1="62" y1="62" x2="86" y2="86" stroke={lijn} strokeWidth="9" strokeLinecap="round" strokeDasharray="34" strokeDashoffset={34 * (1 - klem(q * 2 - 1))} />
      </svg>
    );
  if (soort === "vink")
    return (
      <svg width="170" height="170" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill={kleur.ok} opacity={q} />
        <path d="M30 52 L45 66 L72 36" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - klem(q * 1.5 - 0.5))} />
      </svg>
    );
  if (soort === "pijl")
    return (
      <svg width="170" height="170" viewBox="0 0 100 100">
        <path d="M15 70 Q50 10 85 40" fill="none" stroke={lijn} strokeWidth="7" strokeLinecap="round" strokeDasharray="110" strokeDashoffset={110 * (1 - q)} />
        <path d="M70 30 L86 40 L74 55" fill="none" stroke={lijn} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={klem(q * 2 - 1)} />
      </svg>
    );
  return (
    <svg width="170" height="170" viewBox="0 0 100 100" style={{ transform: `rotate(${(1 - q) * -90}deg) scale(${q})` }}>
      <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" fill={lijn} />
    </svg>
  );
}

// ---------- kaarten ----------
function Tweet({ k, t }: { k: Extract<Kaart, { type: "tweet" }>; t: number }) {
  // De tekst opdelen rond de gemarkeerde zinnen; markeringen vegen van links naar rechts in.
  const delen: { s: string; m?: number; kader?: number }[] = [];
  let rest = k.tekst;
  const merk = [...(k.markeer ?? []).map((m) => ({ ...m, kader: false })), ...(k.kader ? [{ ...k.kader, kader: true }] : [])].sort((a, b) => rest.indexOf(a.zin) - rest.indexOf(b.zin));
  for (const m of merk) {
    const i = rest.indexOf(m.zin);
    if (i < 0) continue;
    if (i > 0) delen.push({ s: rest.slice(0, i) });
    delen.push(m.kader ? { s: m.zin, kader: m.start } : { s: m.zin, m: m.start });
    rest = rest.slice(i + m.zin.length);
  }
  if (rest) delen.push({ s: rest });
  return (
    <Frame style={{ background: stijl.donker ? "#0f1219" : "#ffffff", padding: "44px 46px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 86, height: 86, borderRadius: 43, background: `linear-gradient(135deg, ${kleur.accent}, ${kleur.accent2})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.sans, fontWeight: 800, fontSize: 40 }}>{k.naam[0]}</div>
        <div>
          <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 36, color: stijl.donker ? "#fff" : "#0f1419", display: "flex", alignItems: "center", gap: 10 }}>
            {k.naam} <span style={{ width: 30, height: 30, borderRadius: 15, background: "#1d9bf0", color: "#fff", fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>✓</span>
          </div>
          <div style={{ fontFamily: font.sans, fontSize: 28, color: "#71767b" }}>@{k.handle.replace(/^@/, "")}</div>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: font.sans, fontWeight: 800, fontSize: 44, color: stijl.donker ? "#fff" : "#0f1419" }}>𝕏</div>
      </div>
      <div style={{ marginTop: 34, fontFamily: font.sans, fontSize: 42, lineHeight: 1.38, color: stijl.donker ? "#e7e9ea" : "#0f1419", whiteSpace: "pre-wrap" }}>
        {delen.map((d, i) => {
          if (d.m !== undefined) {
            const q = p(t, d.m, 0.45);
            return (
              <span key={i} style={{ backgroundImage: `linear-gradient(${kleur.accent}55, ${kleur.accent}55)`, backgroundRepeat: "no-repeat", backgroundSize: `${q * 100}% 100%`, borderRadius: 6 }}>
                {d.s}
              </span>
            );
          }
          if (d.kader !== undefined) {
            const q = p(t, d.kader, 0.3);
            return (
              <span key={i} style={{ outline: `4px solid rgba(255,70,70,${q})`, outlineOffset: 6, borderRadius: 8 }}>
                {d.s}
              </span>
            );
          }
          return <span key={i}>{d.s}</span>;
        })}
      </div>
      {k.tijd && <div style={{ marginTop: 28, fontFamily: font.sans, fontSize: 26, color: "#71767b" }}>{k.tijd}</div>}
    </Frame>
  );
}

function Device({ k, t }: { k: Extract<Kaart, { type: "device" }>; t: number }) {
  let i = 0;
  k.schermen.forEach((s, j) => t >= s.start && (i = j));
  const huidig = k.schermen[i];
  const vorige = k.schermen[i - 1];
  const q = p(t, huidig?.start ?? 0, 0.35);
  const scherm = (
    <div style={{ ...vul, overflow: "hidden", background: "#000", borderRadius: k.soort === "telefoon" ? 54 : 10 }}>
      {vorige && <Img src={staticFile(vorige.src)} style={{ ...vul, width: "100%", height: "100%", objectFit: "cover" }} />}
      {huidig && <Img src={staticFile(huidig.src)} style={{ ...vul, width: "100%", height: "100%", objectFit: "cover", opacity: q, filter: `blur(${(1 - q) * 14}px)` }} />}
    </div>
  );
  const pil = k.pil && t >= k.pil.start && (
    <div style={{ position: "absolute", left: "50%", bottom: -10, transform: `translate(-50%, ${(1 - p(t, k.pil.start)) * 30}px)`, opacity: p(t, k.pil.start), padding: "16px 34px", borderRadius: 999, background: "#fff", color: "#0b0c12", fontFamily: font.sans, fontWeight: 700, fontSize: 34, boxShadow: "0 16px 40px rgba(0,0,0,.25)", whiteSpace: "nowrap" }}>{k.pil.tekst}</div>
  );
  if (k.soort === "telefoon")
    return (
      <div style={{ ...vul, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ position: "relative", width: "52%", aspectRatio: "9 / 19.5", borderRadius: 64, background: "#111", padding: 14, boxShadow: "0 30px 70px rgba(0,0,0,.4)" }}>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>{scherm}</div>
        </div>
        {pil}
      </div>
    );
  if (k.soort === "laptop")
    return (
      <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "92%", aspectRatio: "16 / 10.4", borderRadius: "26px 26px 6px 6px", background: "#16181d", padding: 18, boxShadow: "0 30px 70px rgba(0,0,0,.35)" }}>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>{scherm}</div>
        </div>
        <div style={{ width: "104%", height: 30, borderRadius: "0 0 26px 26px", background: "linear-gradient(180deg,#d7dae0,#a9adb6)" }} />
        {pil}
      </div>
    );
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9.4", borderRadius: 18, background: "#0c0d10", padding: 16, boxShadow: "0 30px 70px rgba(0,0,0,.4)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>{scherm}</div>
      </div>
      <div style={{ width: 40, height: 60, background: "#2a2c33" }} />
      <div style={{ width: 300, height: 14, borderRadius: 7, background: "#2a2c33" }} />
      {pil}
    </div>
  );
}

function Keys({ k, t }: { k: Extract<Kaart, { type: "keys" }>; t: number }) {
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      {k.titel && <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 64, letterSpacing: -2, color: stijl.donker ? "#fff" : kleur.text, ...opkomst(t, k.toetsen[0]?.start - 0.4 || 0) }}>{k.titel}</div>}
      <div style={{ display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center" }}>
        {k.toetsen.map((x, i) => (
          <Keycap key={i} t={t} start={x.start} tekst={x.t} breed={x.t.length > 6} />
        ))}
      </div>
    </div>
  );
}

function Mail({ k, t }: { k: Extract<Kaart, { type: "mail" }>; t: number }) {
  return (
    <Frame style={{ background: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 70, display: "flex", alignItems: "center", gap: 10, padding: "0 26px", background: "#f3f4f7", borderBottom: "1px solid #e4e6ec" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
        ))}
        <span style={{ marginLeft: "auto", fontFamily: font.sans, fontSize: 22, color: "#8a8f9c" }}>✉ Mail</span>
      </div>
      <div style={{ padding: "34px 40px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 46, color: "#0b0c12", letterSpacing: -1 }}>{k.onderwerp}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 52, height: 52, borderRadius: 26, background: kleur.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.sans, fontWeight: 700, fontSize: 26 }}>{k.van[0]}</span>
          <span style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 30, color: "#0b0c12" }}>{k.van}</span>
        </div>
        <div style={{ fontFamily: font.sans, fontSize: 32, lineHeight: 1.45, color: "#3a3d48" }}>{k.tekst}</div>
        {k.antwoord && t >= k.antwoord.start - 0.3 && (
          <div style={{ marginTop: 18, padding: "22px 26px", borderRadius: 20, background: `${kleur.accent}12`, border: `2px solid ${kleur.accent}55`, fontFamily: font.sans, fontSize: 32, lineHeight: 1.4, color: "#0b0c12", ...opkomst(t, k.antwoord.start - 0.3, 20) }}>
            <div style={{ fontFamily: font.sans, fontSize: 22, fontWeight: 600, color: kleur.accent, marginBottom: 8 }}>Antwoord</div>
            {getypt(k.antwoord.tekst, t, k.antwoord.start)}
            <span style={{ color: kleur.accent, opacity: Math.floor(t * 3) % 2 ? 1 : 0.2 }}>▍</span>
          </div>
        )}
      </div>
    </Frame>
  );
}

const ICOON_PLEKKEN: [number, number][] = [
  [0.02, 0.06], [0.86, 0.04], [0.0, 0.42], [0.9, 0.4], [0.06, 0.8], [0.84, 0.8], [0.45, -0.04], [0.45, 0.92],
];
function Checklist({ k, t }: { k: Extract<Kaart, { type: "checklist" }>; t: number }) {
  return (
    <div style={{ ...vul }}>
      {(k.iconen ?? []).map((ic, i) => {
        const [x, y] = ICOON_PLEKKEN[i % ICOON_PLEKKEN.length];
        const zweef = Math.sin(t * 1.6 + i) * 8;
        return (
          <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, transform: `translateY(${zweef}px)` }}>
            <AppTegel naam={ic.naam} kleurTegel={ic.kleur} t={t} start={ic.start} slot={ic.slot} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: "18%", right: "18%", top: "18%", padding: "34px 38px", borderRadius: 34, background: "#fff", border: `3px solid ${kleur.accent}66`, boxShadow: "0 30px 80px rgba(20,30,60,.2)" }}>
        <div style={{ display: "flex", gap: 9, marginBottom: 18 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
          ))}
        </div>
        <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 52, color: "#0b0c12", marginBottom: 18 }}>{k.titel}</div>
        {k.items.map((it, i) => {
          if (t < it.start - 0.1) return null;
          const af = it.af !== undefined && t >= it.af ? p(t, it.af, 0.3) : 0;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 0", ...opkomst(t, it.start - 0.1, 16) }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, border: `3px solid ${af ? kleur.accent : "#c3c7d1"}`, background: af ? kleur.accent : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{af ? "✓" : ""}</span>
              <span style={{ position: "relative", fontFamily: font.sans, fontSize: 36, color: af ? "#9aa0ad" : "#1b1d26" }}>
                {it.t}
                <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${af * 100}%`, background: "#9aa0ad" }} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Voice({ k, t }: { k: Extract<Kaart, { type: "voice" }>; t: number }) {
  const klaar = k.klaar !== undefined && t >= k.klaar;
  return (
    <div style={{ ...vul, borderRadius: 40, overflow: "hidden", background: "radial-gradient(90% 70% at 50% 30%, #12305e, #050b1a)", border: "2px solid rgba(110,190,255,.35)", boxShadow: "0 30px 80px rgba(0,0,0,.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 46, ...opkomst(t, k.start - 0.3) }}>
      <div style={{ position: "absolute", left: 36, top: 36, right: 36, display: "flex", justifyContent: "space-between", fontFamily: font.mono, fontSize: 20, letterSpacing: 3, color: "rgba(150,210,255,.7)" }}>
        <span>ASSISTENT</span>
        <span>{klaar ? "● KLAAR" : "● ACTIEF"}</span>
      </div>
      <div style={{ width: 230, height: 230, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #9fd4ff, #2f7cff 45%, #0a2a66 75%)", boxShadow: `0 0 ${80 + 30 * Math.sin(t * 3)}px rgba(80,170,255,.75)` }} />
      <Golf t={t} kleurGolf="#7cc4ff" balken={30} hoogte={110} />
      <div style={{ padding: "16px 34px", borderRadius: 999, background: "rgba(10,25,55,.85)", border: "2px solid rgba(110,190,255,.4)", color: "#dff1ff", fontFamily: font.sans, fontWeight: 600, fontSize: 34 }}>
        <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 7, background: klaar ? "#3ecf8e" : "#7cc4ff", marginRight: 14, opacity: klaar ? 1 : 0.5 + 0.5 * Math.sin(t * 6) }} />
        {klaar ? "Klaar" : k.status}
      </div>
      {k.tekst && <div style={{ maxWidth: "80%", textAlign: "center", fontFamily: font.sans, fontSize: 38, lineHeight: 1.35, color: "#fff" }}>{getypt(k.tekst, t, k.start + 0.3)}</div>}
    </div>
  );
}

function Ring({ k, t }: { k: Extract<Kaart, { type: "ring" }>; t: number }) {
  const q = p(t, k.start, 0.6);
  const letters = k.naam.split("");
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ position: "relative", width: 640, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="640" height="640" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, transform: `rotate(${t * 40}deg)`, opacity: q }}>
          <circle cx="50" cy="50" r="46" fill="none" stroke={kleur.accent} strokeWidth="1.6" strokeDasharray="1.5 2.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={kleur.accent} strokeOpacity=".35" strokeWidth="0.6" />
        </svg>
        <div style={{ display: "flex", fontFamily: font.sans, fontWeight: 800, fontSize: Math.min(160, 860 / Math.max(4, letters.length)), letterSpacing: -4, color: stijl.donker ? "#fff" : kleur.text }}>
          {letters.map((c, i) => (
            <span key={i} style={opkomst(t, k.start + 0.07 * i, 30)}>
              {c}
            </span>
          ))}
        </div>
      </div>
      {k.toetsen && (
        <div style={{ display: "flex", gap: 20 }}>
          {k.toetsen.map((x, i) => (
            <Keycap key={i} t={t} start={k.start + 0.6 + 0.2 * i} tekst={x} />
          ))}
        </div>
      )}
    </div>
  );
}

function Logos({ k, t }: { k: Extract<Kaart, { type: "logos" }>; t: number }) {
  const g = k.getal;
  const rood = g?.rood !== undefined && t >= g.rood;
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      {k.logos.map((l, i) => {
        if (t < l.start - 0.05) return null;
        const weg = l.weg !== undefined && t >= l.weg ? p(t, l.weg, 0.3) : 0;
        return (
          <div key={i} style={{ position: "relative", fontFamily: font.sans, fontWeight: 800, fontSize: 64, letterSpacing: -1.5, color: l.kleur ?? (stijl.donker ? "#fff" : kleur.text), opacity: 1 - 0.5 * weg, ...opkomst(t, l.start - 0.05, 24) }}>
            {l.naam}
            <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 7, borderRadius: 4, background: kleur.bad, transformOrigin: "left", transform: `scaleX(${weg})` }} />
          </div>
        );
      })}
      {g && t >= g.start - 0.05 && (
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, ...opkomst(t, g.start - 0.05) }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            {g.prefix && <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 180, lineHeight: 1, color: rood ? kleur.bad : stijl.donker ? "#fff" : kleur.text }}>{g.prefix}</span>}
            <Odometer waarde={g.waarde} t={t} start={g.start} duur={g.duur ?? 1.4} hoogte={180} kleurTekst={rood ? kleur.bad : stijl.donker ? "#fff" : kleur.text} />
            {g.suffix && <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 100, lineHeight: 1.4, color: rood ? kleur.bad : kleur.muted }}>{g.suffix}</span>}
          </div>
          {g.label && <div style={{ fontFamily: font.mono, fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: kleur.muted }}>{g.label}</div>}
        </div>
      )}
    </div>
  );
}

function Ranking({ k, t }: { k: Extract<Kaart, { type: "ranking" }>; t: number }) {
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, padding: "0 20px" }}>
      {k.titel && <div style={{ fontFamily: font.mono, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: kleur.muted, textAlign: "right", marginBottom: 6 }}>{k.titel}</div>}
      {k.items.map((it, i) => {
        if (t < it.start - 0.05) return null;
        const licht = it.licht !== undefined && t >= it.licht ? p(t, it.licht, 0.3) : 0;
        const weg = it.weg !== undefined && t >= it.weg ? p(t, it.weg, 0.3) : 0;
        return (
          <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, padding: "18px 24px", borderRadius: 18, background: `rgba(${stijl.donker ? "255,106,26" : "224,100,79"},${0.16 * licht})`, ...opkomst(t, it.start - 0.05, 20) }}>
            <span style={{ fontFamily: font.mono, fontWeight: 600, fontSize: 34, color: licht ? kleur.accent : kleur.muted, width: 90 }}>#{it.nr}</span>
            <span style={{ position: "relative", fontFamily: font.sans, fontWeight: 600, fontSize: 40, color: stijl.donker ? "#fff" : kleur.text, opacity: 1 - 0.5 * weg }}>
              {it.t}
              <span style={{ position: "absolute", left: 0, top: "52%", height: 4, width: `${weg * 100}%`, background: kleur.bad }} />
            </span>
            {it.delta && <span style={{ marginLeft: "auto", fontFamily: font.mono, fontSize: 28, color: kleur.accent, opacity: licht || 0.35 }}>↑ {it.delta}</span>}
          </div>
        );
      })}
    </div>
  );
}

function Headline({ k, t }: { k: Extract<Kaart, { type: "headline" }>; t: number }) {
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" }}>
      {k.icoon && <Icoon soort={k.icoon} t={t} start={k.start} />}
      {k.regels.map((r, i) => (
        <div key={i} style={{ fontFamily: font.serif, fontStyle: stijl.serifCursief ? "italic" : "normal", fontSize: Math.min(150, 1700 / Math.max(6, r.t.length)), lineHeight: 1, letterSpacing: 1, textTransform: "uppercase", color: r.accent ? kleur.accent : stijl.donker ? "#fff" : kleur.text, ...opkomst(t, k.start + 0.12 * i + (k.icoon ? 0.3 : 0)) }}>
          {r.t}
        </div>
      ))}
    </div>
  );
}

function Pixel({ k, t }: { k: Extract<Kaart, { type: "pixel" }>; t: number }) {
  const letters = k.tekst.split("");
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      {k.label && <div style={{ fontFamily: font.serif, fontSize: 64, letterSpacing: 4, textTransform: "uppercase", color: kleur.accent, ...opkomst(t, k.start - 0.3) }}>{k.label}</div>}
      {k.icoon && (
        <div style={{ width: 200, height: 200, borderRadius: 48, background: "#fff", boxShadow: "0 24px 60px rgba(20,20,40,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 110, ...opkomst(t, k.start - 0.2) }}>{k.icoon}</div>
      )}
      <div style={{ display: "flex", fontFamily: "'Jersey 10', monospace", fontSize: Math.min(240, 1500 / Math.max(4, letters.length)), lineHeight: 1, color: kleur.accent }}>
        {letters.map((c, i) => (
          <span key={i} style={{ opacity: t >= k.start + 0.06 * i ? 1 : 0, whiteSpace: "pre" }}>
            {c}
          </span>
        ))}
      </div>
      {k.sub && <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 70, letterSpacing: 26, color: stijl.donker ? "#fff" : kleur.text, ...opkomst(t, k.start + 0.06 * letters.length) }}>{k.sub.toUpperCase().split("").join(" ")}</div>}
    </div>
  );
}

function Toggle({ k, t }: { k: Extract<Kaart, { type: "toggle" }>; t: number }) {
  const q = p(t, k.start, 0.35);
  const kleurPil = q > 0.5 ? kleur.ok : "#a3a8b4";
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
      <div style={{ width: 200, height: 200, borderRadius: 48, background: "#fff", boxShadow: "0 24px 60px rgba(20,20,40,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.sans, fontWeight: 800, fontSize: 90, color: kleur.accent }}>{k.naam[0]}</div>
      <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 66, letterSpacing: -2, color: stijl.donker ? "#fff" : kleur.text }}>{k.naam}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "14px 18px 14px 36px", borderRadius: 999, background: `${kleurPil}22`, border: `3px solid ${kleurPil}` }}>
        <span style={{ fontFamily: font.mono, fontSize: 30, letterSpacing: 3, color: kleurPil }}>{q > 0.5 ? k.naar ?? "VERLEEND" : k.van ?? "TOEGANG UIT"}</span>
        <span style={{ position: "relative", width: 120, height: 64, borderRadius: 32, background: kleurPil }}>
          <span style={{ position: "absolute", top: 6, left: 6 + 56 * q, width: 52, height: 52, borderRadius: 26, background: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,.25)" }} />
        </span>
      </div>
      <div style={{ opacity: klem(q * 2 - 1) }}>
        <Icoon soort="ster" t={t} start={k.start + 0.2} />
      </div>
    </div>
  );
}

function Installer({ k, t }: { k: Extract<Kaart, { type: "installer" }>; t: number }) {
  const q = klem((t - k.start) / (k.duur ?? 2.2));
  const balkKleur = q < 1 ? (stijl.donker ? "#fff" : "#1b1d26") : kleur.accent;
  return (
    <div style={{ ...vul, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40, padding: "0 40px" }}>
      <div style={{ fontFamily: font.mono, fontSize: 34, color: stijl.donker ? "#fff" : kleur.text }}>
        <span style={{ color: kleur.accent }}>❯ </span>
        {k.titel}
      </div>
      <div style={{ height: 34, borderRadius: 17, background: stijl.donker ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${q * 100}%`, background: balkKleur, borderRadius: 17 }} />
      </div>
      <div style={{ fontFamily: font.mono, fontSize: 28, color: kleur.muted, textAlign: "right" }}>{Math.round(q * 100)}%</div>
      {k.stappen && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          {k.stappen.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", ...opkomst(t, s.start) }}>
              <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 130, lineHeight: 1, color: kleur.accent, transform: `rotate(${(i % 2 ? 1 : -1) * 6}deg)` }}>{i + 1}</div>
              <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 34, color: stijl.donker ? "#fff" : kleur.text, marginTop: 10 }}>{s.t}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tekent een extra kaartsoort; geeft null voor soorten die Card.tsx zelf tekent. */
export function Extra({ kaart, t }: { kaart: Kaart; t: number }): ReactNode {
  switch (kaart.type) {
    case "tweet":
      return <Tweet k={kaart} t={t} />;
    case "device":
      return <Device k={kaart} t={t} />;
    case "keys":
      return <Keys k={kaart} t={t} />;
    case "mail":
      return <Mail k={kaart} t={t} />;
    case "checklist":
      return <Checklist k={kaart} t={t} />;
    case "voice":
      return <Voice k={kaart} t={t} />;
    case "ring":
      return <Ring k={kaart} t={t} />;
    case "logos":
      return <Logos k={kaart} t={t} />;
    case "ranking":
      return <Ranking k={kaart} t={t} />;
    case "headline":
      return <Headline k={kaart} t={t} />;
    case "pixel":
      return <Pixel k={kaart} t={t} />;
    case "toggle":
      return <Toggle k={kaart} t={t} />;
    case "installer":
      return <Installer k={kaart} t={t} />;
    default:
      return null;
  }
}

/** Terminalregels van het soort "weg" (doorgestreept) en "balk" (voortgangsbalk), voor de terminal van elke stijl. */
export function TerminalExtra({ r, t, kleurTekst }: { r: { t: string; start: number; soort?: string; waarde?: number }; t: number; kleurTekst: string }) {
  if (r.soort === "weg") {
    const q = p(t, r.start, 0.3);
    return (
      <span style={{ position: "relative", color: kleur.bad, opacity: 0.85 }}>
        {r.t}
        <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${q * 100}%`, background: kleur.bad }} />
      </span>
    );
  }
  if (r.soort === "balk") {
    const q = p(t, r.start, 0.9) * klem((r.waarde ?? 100) / 100);
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ width: 200, color: kleurTekst }}>{r.t}</span>
        <span style={{ flex: 1, height: 16, borderRadius: 8, background: "rgba(127,127,127,.25)", overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", width: `${q * 100}%`, background: kleur.ok }} />
        </span>
        <span style={{ width: 60, textAlign: "right", color: kleurTekst }}>{Math.round(q * 100)}</span>
      </span>
    );
  }
  return null;
}

export function TerminalTeller({ teller, t }: { teller?: { label: string; tot: number; start: number; duur?: number }; t: number }) {
  if (!teller || t < teller.start) return null;
  const q = p(t, teller.start, teller.duur ?? 1.2);
  return (
    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 10, padding: "4px 14px", borderRadius: 999, border: `2px solid ${kleur.bad}88`, color: kleur.bad, fontFamily: font.mono, fontSize: 20 }}>
      {teller.label} {Math.round(teller.tot * q)}/{teller.tot}
    </span>
  );
}

export { Pil };
