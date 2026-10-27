// De spreker: in een afgeronde box (split/hook), beeldvullend ingezoomd (close) of weggeschoven (full).
// Met een alpha-uitsnede (speaker_alpha.mov) steekt het hoofd boven de box uit.
import { OffthreadVideo, staticFile } from "remotion";
import { H, W, kleur } from "./theme";
import type { Meta } from "./types";

type Box = { x: number; y: number; w: number; h: number; r: number };

export function Speaker({ meta, box, stand, t }: { meta: Meta; box: Box | "vol" | "weg"; stand: number; t: number }) {
  // `stand`: 0 = weggeschoven, 1 = op zijn plek (geanimeerd door Reel.tsx)
  const [fx, fy] = meta.spreker.focus;
  const bron = meta.spreker.alpha ? "speaker_alpha.mov" : "speaker.mp4";

  if (box === "vol") {
    const z = meta.spreker.zoomClose;
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: kleur.bg, opacity: stand }}>
        <OffthreadVideo
          src={staticFile("speaker.mp4")}
          muted
          style={{ position: "absolute", width: W, height: H, objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%` }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,7,10,0) 45%, rgba(6,7,10,.85) 100%)" }} />
      </div>
    );
  }

  const b = box === "weg" ? { x: 76, y: 1300, w: 928, h: 720, r: 80 } : box;
  const y = b.y + (1 - stand) * (H - b.y + 40);
  const z = meta.spreker.zoomBox;
  // Video van 1080×1920 in een box van b.w × b.h: schaal zodat de box gevuld is en het gezicht op ~35% hoogte van de box staat.
  const schaal = Math.max(b.w / W, b.h / H) * z;
  const vw = W * schaal;
  const vh = H * schaal;
  const left = b.w / 2 - fx * vw;
  const top = b.h * 0.42 - fy * vh;
  const video = (
    <OffthreadVideo
      src={staticFile(bron)}
      muted
      transparent={meta.spreker.alpha}
      style={{ position: "absolute", left, top, width: vw, height: vh }}
    />
  );
  return (
    <div style={{ position: "absolute", left: b.x, top: y, width: b.w, height: b.h }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: b.r,
          background: `radial-gradient(80% 70% at 50% 30%, #1b1510, ${kleur.surface})`,
          border: `2px solid ${kleur.line}`,
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
          overflow: "hidden",
        }}
      >
        {!meta.spreker.alpha && video}
      </div>
      {/* Met alpha staat de video buiten het masker, zodat het hoofd boven de box uitsteekt. */}
      {meta.spreker.alpha && <div style={{ position: "absolute", left: 0, top: -400, width: b.w, height: b.h + 400, overflow: "hidden" }}><div style={{ position: "absolute", left: 0, top: 400, width: b.w, height: b.h }}>{video}</div></div>}
      <div style={{ position: "absolute", inset: 0, borderRadius: b.r, boxShadow: `inset 0 0 0 2px rgba(255,106,26,.15)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, display: "flex", justifyContent: "center" }}>
        <div style={{ marginTop: 22, width: 64, height: 5, borderRadius: 3, background: kleur.accent, opacity: 0.9 + 0.1 * Math.sin(t * 3) }} />
      </div>
    </div>
  );
}
