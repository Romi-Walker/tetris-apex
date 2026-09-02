import { css } from "./color";
import type { ThemePalette } from "./palettes";

export function applyPaletteCss(palette: ThemePalette, el: HTMLElement): void {
  const s = el.style;
  s.setProperty("--ta-bg", css(palette.background));
  s.setProperty("--ta-chrome", css(palette.chrome));
  s.setProperty("--ta-chrome-border", css(palette.chromeBorder));
  s.setProperty("--ta-well", css(palette.well));
  s.setProperty("--ta-empty", css(palette.empty));
  s.setProperty("--ta-text", css(palette.text));
  s.setProperty("--ta-muted", css(palette.muted));
  s.setProperty("--ta-accent", css(palette.accent));
  s.setProperty("--ta-grid", css(palette.gridLine));
}
