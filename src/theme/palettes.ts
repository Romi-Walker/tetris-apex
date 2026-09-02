import type { PieceType } from "../engine/types";
import { rgb, type Rgba } from "./color";
import { soundSlotsFor, THEME_NAMES, type ThemeId } from "./ids";

export interface ThemePalette {
  id: ThemeId;
  name: string;
  background: Rgba;
  chrome: Rgba;
  chromeBorder: Rgba;
  well: Rgba;
  empty: Rgba;
  gridLine: Rgba;
  ghostAlpha: number;
  text: Rgba;
  muted: Rgba;
  accent: Rgba;
  pieces: Record<PieceType, Rgba>;
  soundSlots: Record<string, string>;
}

function make(
  id: ThemeId,
  spec: Omit<ThemePalette, "id" | "name" | "soundSlots">,
): ThemePalette {
  return {
    id,
    name: THEME_NAMES[id],
    soundSlots: soundSlotsFor(id),
    ...spec,
  };
}

export const THEME_PALETTES: Record<ThemeId, ThemePalette> = {
  "neon-city": make("neon-city", {
    background: rgb(5, 4, 12),
    chrome: rgb(42, 14, 48, 0.72),
    chromeBorder: rgb(255, 90, 200, 0.22),
    well: rgb(8, 6, 16),
    empty: rgb(16, 12, 28),
    gridLine: rgb(255, 180, 255, 0.1),
    ghostAlpha: 0.34,
    text: rgb(242, 236, 255),
    muted: rgb(168, 150, 190),
    accent: rgb(0, 240, 255),
    pieces: {
      I: rgb(0, 240, 255),
      O: rgb(255, 230, 0),
      T: rgb(255, 46, 200),
      S: rgb(61, 255, 122),
      Z: rgb(255, 51, 88),
      J: rgb(77, 122, 255),
      L: rgb(255, 140, 26),
    },
  }),
  "deep-ocean": make("deep-ocean", {
    background: rgb(2, 14, 24),
    chrome: rgb(8, 36, 58, 0.74),
    chromeBorder: rgb(70, 190, 230, 0.22),
    well: rgb(3, 18, 28),
    empty: rgb(4, 16, 26),
    gridLine: rgb(120, 210, 255, 0.1),
    ghostAlpha: 0.36,
    text: rgb(230, 244, 252),
    muted: rgb(130, 168, 186),
    accent: rgb(46, 232, 255),
    pieces: {
      I: rgb(46, 232, 255),
      O: rgb(245, 215, 110),
      T: rgb(210, 168, 255),
      S: rgb(46, 229, 154),
      Z: rgb(255, 90, 122),
      J: rgb(61, 139, 255),
      L: rgb(255, 159, 67),
    },
  }),
  "aurora-forest": make("aurora-forest", {
    background: rgb(4, 16, 10),
    chrome: rgb(10, 40, 26, 0.74),
    chromeBorder: rgb(80, 230, 160, 0.22),
    well: rgb(6, 20, 14),
    empty: rgb(10, 32, 22),
    gridLine: rgb(140, 255, 190, 0.1),
    ghostAlpha: 0.33,
    text: rgb(232, 252, 240),
    muted: rgb(140, 180, 158),
    accent: rgb(77, 255, 176),
    pieces: {
      I: rgb(94, 240, 208),
      O: rgb(232, 240, 122),
      T: rgb(196, 92, 255),
      S: rgb(77, 255, 136),
      Z: rgb(255, 94, 110),
      J: rgb(74, 168, 255),
      L: rgb(255, 179, 71),
    },
  }),
  "desert-night": make("desert-night", {
    background: rgb(16, 10, 6),
    chrome: rgb(42, 26, 14, 0.74),
    chromeBorder: rgb(230, 170, 80, 0.24),
    well: rgb(20, 12, 6),
    empty: rgb(32, 20, 10),
    gridLine: rgb(255, 200, 120, 0.1),
    ghostAlpha: 0.35,
    text: rgb(255, 244, 230),
    muted: rgb(186, 160, 132),
    accent: rgb(255, 176, 64),
    pieces: {
      I: rgb(90, 212, 232),
      O: rgb(255, 210, 74),
      T: rgb(212, 107, 255),
      S: rgb(125, 207, 74),
      Z: rgb(255, 83, 71),
      J: rgb(91, 140, 255),
      L: rgb(255, 138, 43),
    },
  }),
  "space-station": make("space-station", {
    background: rgb(8, 11, 16),
    chrome: rgb(24, 32, 44, 0.78),
    chromeBorder: rgb(160, 190, 220, 0.2),
    well: rgb(10, 14, 20),
    empty: rgb(18, 24, 34),
    gridLine: rgb(180, 200, 220, 0.1),
    ghostAlpha: 0.32,
    text: rgb(236, 242, 248),
    muted: rgb(148, 160, 176),
    accent: rgb(92, 225, 255),
    pieces: {
      I: rgb(92, 225, 255),
      O: rgb(240, 208, 96),
      T: rgb(176, 122, 255),
      S: rgb(74, 222, 128),
      Z: rgb(255, 77, 106),
      J: rgb(91, 141, 239),
      L: rgb(255, 159, 64),
    },
  }),
  "volcanic-core": make("volcanic-core", {
    background: rgb(16, 6, 6),
    chrome: rgb(52, 16, 14, 0.74),
    chromeBorder: rgb(255, 90, 50, 0.24),
    well: rgb(18, 8, 8),
    empty: rgb(32, 12, 10),
    gridLine: rgb(255, 140, 80, 0.1),
    ghostAlpha: 0.34,
    text: rgb(255, 236, 230),
    muted: rgb(190, 140, 130),
    accent: rgb(255, 122, 24),
    pieces: {
      I: rgb(64, 224, 255),
      O: rgb(255, 208, 0),
      T: rgb(196, 77, 255),
      S: rgb(61, 206, 112),
      Z: rgb(255, 59, 59),
      J: rgb(77, 127, 255),
      L: rgb(255, 122, 24),
    },
  }),
  "crystal-cave": make("crystal-cave", {
    background: rgb(10, 6, 20),
    chrome: rgb(28, 16, 48, 0.74),
    chromeBorder: rgb(180, 120, 255, 0.24),
    well: rgb(12, 8, 24),
    empty: rgb(22, 14, 40),
    gridLine: rgb(200, 160, 255, 0.12),
    ghostAlpha: 0.36,
    text: rgb(244, 236, 255),
    muted: rgb(168, 150, 196),
    accent: rgb(224, 96, 255),
    pieces: {
      I: rgb(110, 240, 255),
      O: rgb(255, 229, 107),
      T: rgb(224, 96, 255),
      S: rgb(93, 255, 176),
      Z: rgb(255, 90, 154),
      J: rgb(106, 139, 255),
      L: rgb(255, 176, 64),
    },
  }),
  "cyber-rain": make("cyber-rain", {
    background: rgb(3, 10, 6),
    chrome: rgb(8, 32, 18, 0.74),
    chromeBorder: rgb(40, 255, 90, 0.22),
    well: rgb(5, 16, 8),
    empty: rgb(8, 28, 14),
    gridLine: rgb(80, 255, 120, 0.12),
    ghostAlpha: 0.33,
    text: rgb(220, 255, 228),
    muted: rgb(120, 176, 136),
    accent: rgb(57, 255, 20),
    pieces: {
      I: rgb(0, 255, 208),
      O: rgb(212, 255, 74),
      T: rgb(168, 85, 255),
      S: rgb(57, 255, 20),
      Z: rgb(255, 42, 74),
      J: rgb(0, 168, 255),
      L: rgb(255, 153, 0),
    },
  }),
};

export function paletteOf(id: ThemeId): ThemePalette {
  return THEME_PALETTES[id];
}
