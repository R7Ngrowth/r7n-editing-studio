// De reel: scènes uit src/data/scenes.json, ondertitels uit captions.json, spreker uit public/speaker.mp4.
// Lay-outs schuiven in 0,32 s naar elkaar toe; elke kaart komt binnen op het woord waar hij bij hoort.
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "./Captions";
import { Card } from "./cards/Card";
import captions from "./data/captions.json";
import meta from "./data/meta.json";
import scenes from "./data/scenes.json";
import { laadFonts } from "./fonts";
import { Speaker } from "./Speaker";
import { ease, kleur, layout as LAYOUT } from "./theme";
import type { Captions as CaptionsData, Meta, Scene } from "./types";

const SCENES = scenes as Scene[];
const CAPTIONS = captions as CaptionsData;
const META = meta as Meta;
const OVERGANG = 0.32;

const tussen = (a: number, b: number, p: number) => a + (b - a) * p;

export const Reel = () => {
  laadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  let i = 0;
  for (let k = 0; k < SCENES.length; k++) if (t >= SCENES[k].start) i = k;
  const scene = SCENES[i] ?? { start: 0, layout: "split", kaart: { type: "none" } };
  const vorige = SCENES[i - 1] ?? scene;
  const p = ease((t - scene.start) / OVERGANG);
  const L = LAYOUT[scene.layout];
  const V = LAYOUT[vorige.layout];

  const kaart = {
    x: tussen(V.kaart.x, L.kaart.x, p),
    y: tussen(V.kaart.y, L.kaart.y, p),
    w: tussen(V.kaart.w, L.kaart.w, p),
    h: tussen(V.kaart.h, L.kaart.h, p),
  };
  const ondertitelY = tussen(V.ondertitelY, L.ondertitelY, p);
  const sprekerStand = tussen(V.spreker === "weg" ? 0 : 1, L.spreker === "weg" ? 0 : 1, p);
  const donker = scene.layout === "full" || scene.layout === "close";
  const closeStand = tussen(vorige.layout === "close" ? 1 : 0, scene.layout === "close" ? 1 : 0, p);
  const fadeIn = Math.min(1, frame / 5);

  return (
    <AbsoluteFill style={{ background: kleur.bg, overflow: "hidden" }}>
      {/* geluid los van het beeld: de sprekervideo's zijn gedempt en worden bij `full` ontkoppeld, anders valt de stem weg */}
      <Audio src={staticFile("speaker.mp4")} />
      {/* achtergrond: zachte oranje gloed, dieper bij donkere lay-outs */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 45% at 15% 8%, rgba(255,106,26,${donker ? 0.22 : 0.14}) 0%, rgba(255,106,26,0) 60%), radial-gradient(60% 40% at 90% 95%, rgba(91,116,255,0.14) 0%, rgba(91,116,255,0) 60%), ${kleur.bg}`,
        }}
      />
      {/* spreker beeldvullend (close) ligt onder alles */}
      {closeStand > 0 && <Speaker meta={META} box="vol" stand={closeStand} t={t} />}

      {/* kaart */}
      {scene.kaart.type !== "none" && scene.layout !== "close" && (
        <div key={i} style={{ position: "absolute", left: kaart.x, top: kaart.y, width: kaart.w, height: kaart.h, opacity: 1 - closeStand }}>
          <div style={{ position: "absolute", inset: 0, ...(t - scene.start < 0.3 ? { transform: `translateY(${(1 - p) * 60}px) scale(${0.94 + 0.06 * p})`, filter: `blur(${(1 - p) * 12}px)`, opacity: p } : {}) }}>
            <Card kaart={scene.kaart} t={t} sceneStart={scene.start} />
          </div>
        </div>
      )}

      {/* spreker in de box */}
      {closeStand < 1 && sprekerStand > 0 && <Speaker meta={META} box={L.spreker === "vol" ? "weg" : L.spreker} stand={sprekerStand * (1 - closeStand)} t={t} />}

      <Captions data={CAPTIONS} t={t} y={ondertitelY} donker={donker} />

      <AbsoluteFill style={{ background: kleur.bg, opacity: 1 - fadeIn, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
