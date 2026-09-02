import type { GameSnapshot } from "../engine";
import { css, type ThemePalette } from "../theme";
import { drawPiecePreview } from "../render/piecePreview";

function formatTime(timeMs: number): string {
  const totalSec = Math.max(0, Math.floor(timeMs / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Combo HUD from 2 onward. Engine combo is 1 after the first clear. */
export function comboHudText(combo: number): string {
  if (combo < 2) return "—";
  return String(combo);
}

export function createHud(root: HTMLElement): {
  update(snapshot: GameSnapshot, palette: ThemePalette): void;
} {
  const holdCanvas = root.querySelector<HTMLCanvasElement>("#hold");
  const nextCanvases = [
    ...root.querySelectorAll<HTMLCanvasElement>(".next-piece"),
  ];
  const hudScore = root.querySelector<HTMLElement>("#hud-score");
  const hudLevel = root.querySelector<HTMLElement>("#hud-level");
  const hudLines = root.querySelector<HTMLElement>("#hud-lines");
  const hudCombo = root.querySelector<HTMLElement>("#hud-combo");
  const hudB2b = root.querySelector<HTMLElement>("#hud-b2b");
  const hudTime = root.querySelector<HTMLElement>("#hud-time");
  const hudPps = root.querySelector<HTMLElement>("#hud-pps");

  function update(snapshot: GameSnapshot, palette: ThemePalette): void {
    if (hudScore) hudScore.textContent = String(snapshot.score);
    if (hudLevel) hudLevel.textContent = String(snapshot.level);
    if (hudLines) hudLines.textContent = String(snapshot.linesClearedTotal);
    if (hudCombo) hudCombo.textContent = comboHudText(snapshot.combo);
    if (hudB2b) {
      hudB2b.textContent = snapshot.b2b ? "B2B" : "off";
      hudB2b.classList.toggle("hud-b2b-on", snapshot.b2b);
      if (snapshot.b2b) {
        hudB2b.style.color = css(palette.accent);
      } else {
        hudB2b.style.color = "";
      }
    }
    if (hudTime) hudTime.textContent = formatTime(snapshot.timeMs);
    if (hudPps) hudPps.textContent = snapshot.pps.toFixed(1);
    if (holdCanvas) {
      drawPiecePreview(holdCanvas, snapshot.hold, palette);
    }
    for (let i = 0; i < nextCanvases.length; i++) {
      const canvas = nextCanvases[i];
      if (!canvas) continue;
      drawPiecePreview(canvas, snapshot.next[i] ?? null, palette);
    }
  }

  return { update };
}
