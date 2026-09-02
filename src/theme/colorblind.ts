import { rgb } from "./color";
import type { ThemePalette } from "./palettes";

export type ColorblindMode = "off" | "deuteranopia" | "protanopia" | "high-contrast";

const DEUTERANOPIA_PIECES: ThemePalette["pieces"] = {
  I: rgb(0, 158, 230),
  O: rgb(240, 228, 66),
  T: rgb(232, 186, 255),
  S: rgb(86, 180, 233),
  Z: rgb(230, 159, 0),
  J: rgb(0, 114, 178),
  L: rgb(213, 94, 0),
};

const PROTANOPIA_PIECES: ThemePalette["pieces"] = {
  I: rgb(0, 190, 220),
  O: rgb(255, 238, 90),
  T: rgb(210, 170, 255),
  S: rgb(0, 158, 230),
  Z: rgb(240, 200, 40),
  J: rgb(70, 130, 230),
  L: rgb(255, 150, 40),
};

const HIGH_CONTRAST_PIECES: ThemePalette["pieces"] = {
  I: rgb(255, 255, 255),
  O: rgb(255, 240, 80),
  T: rgb(255, 120, 255),
  S: rgb(80, 255, 160),
  Z: rgb(255, 80, 80),
  J: rgb(90, 160, 255),
  L: rgb(255, 170, 50),
};

export function applyColorblind(palette: ThemePalette, mode: ColorblindMode): ThemePalette {
  if (mode === "off") return palette;
  if (mode === "deuteranopia") {
    return { ...palette, pieces: { ...DEUTERANOPIA_PIECES } };
  }
  if (mode === "protanopia") {
    return { ...palette, pieces: { ...PROTANOPIA_PIECES } };
  }
  return {
    ...palette,
    background: rgb(0, 0, 0),
    well: rgb(0, 0, 0),
    empty: rgb(10, 10, 12),
    chrome: rgb(18, 18, 22, 0.92),
    chromeBorder: rgb(255, 255, 255, 0.45),
    gridLine: rgb(255, 255, 255, 0.28),
    text: rgb(255, 255, 255),
    muted: rgb(200, 200, 210),
    accent: rgb(255, 255, 255),
    pieces: { ...HIGH_CONTRAST_PIECES },
    ghostAlpha: 0.45,
  };
}
