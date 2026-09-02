import type { GameSnapshot } from "../engine";
import { drawPiecePreview } from "../render/piecePreview";

function formatTime(timeMs: number): string {
  const totalSec = Math.max(0, Math.floor(timeMs / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function createHud(root: HTMLElement): {
  update(snapshot: GameSnapshot): void;
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

  function update(snapshot: GameSnapshot): void {
    if (hudScore) hudScore.textContent = String(snapshot.score);
    if (hudLevel) hudLevel.textContent = String(snapshot.level);
    if (hudLines) hudLines.textContent = String(snapshot.linesClearedTotal);
    if (hudCombo) hudCombo.textContent = String(snapshot.combo);
    if (hudB2b) {
      hudB2b.textContent = snapshot.b2b ? "B2B" : "off";
      hudB2b.classList.toggle("hud-b2b-on", snapshot.b2b);
    }
    if (hudTime) hudTime.textContent = formatTime(snapshot.timeMs);
    if (hudPps) hudPps.textContent = snapshot.pps.toFixed(1);
    if (holdCanvas) {
      drawPiecePreview(holdCanvas, snapshot.hold);
    }
    for (let i = 0; i < nextCanvases.length; i++) {
      const canvas = nextCanvases[i];
      if (!canvas) continue;
      drawPiecePreview(canvas, snapshot.next[i] ?? null);
    }
  }

  return { update };
}
