import type { GameSnapshot } from "../engine";
import { drawPiecePreview } from "../render/piecePreview";

export function createHud(root: HTMLElement): {
  update(snapshot: GameSnapshot): void;
} {
  const holdCanvas = root.querySelector<HTMLCanvasElement>("#hold");
  const nextCanvases = [
    ...root.querySelectorAll<HTMLCanvasElement>(".next-piece"),
  ];
  const hudLines = root.querySelector<HTMLElement>("#hud-lines");

  function update(snapshot: GameSnapshot): void {
    if (hudLines) {
      hudLines.textContent = String(snapshot.linesClearedTotal);
    }
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
