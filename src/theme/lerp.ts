import { clamp01, lerp, lerpRgba, opaque, type Rgba } from "./color";
import type { ThemePalette } from "./palettes";

function lerpPieces(from: ThemePalette, to: ThemePalette, t: number): ThemePalette["pieces"] {
  const keys = Object.keys(from.pieces) as Array<keyof ThemePalette["pieces"]>;
  const out = { ...to.pieces };
  for (const key of keys) {
    out[key] = opaque(lerpRgba(from.pieces[key], to.pieces[key], t));
  }
  return out;
}

export function lerpPalette(from: ThemePalette, to: ThemePalette, t: number): ThemePalette {
  const u = clamp01(t);
  // Chrome/background fade linearly; tetromino identity settles faster so cells stay readable.
  const pieceT = clamp01(u * 1.75);
  return {
    id: to.id,
    name: to.name,
    background: lerpRgba(from.background, to.background, u),
    chrome: lerpRgba(from.chrome, to.chrome, u),
    chromeBorder: lerpRgba(from.chromeBorder, to.chromeBorder, u),
    well: lerpRgba(from.well, to.well, u),
    empty: lerpRgba(from.empty, to.empty, u),
    gridLine: lerpRgba(from.gridLine, to.gridLine, u),
    ghostAlpha: lerp(from.ghostAlpha, to.ghostAlpha, u),
    text: lerpRgba(from.text, to.text, u),
    muted: lerpRgba(from.muted, to.muted, u),
    accent: lerpRgba(from.accent, to.accent, u),
    pieces: lerpPieces(from, to, pieceT),
    soundSlots: to.soundSlots,
  };
}

export function mixWhite(base: Rgba, amount: number): Rgba {
  const u = clamp01(amount);
  return opaque(lerpRgba(base, { r: 255, g: 255, b: 255, a: 1 }, u));
}

