import { Composition } from "remotion";
import meta from "./data/meta.json";
import { Reel } from "./Reel";
import { FPS, H, W } from "./theme";

export const Root = () => (
  <Composition id="Reel" component={Reel} durationInFrames={Math.max(30, meta.durationInFrames)} fps={meta.fps || FPS} width={W} height={H} />
);
