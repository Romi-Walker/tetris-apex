import type { GameSnapshot } from "../engine";

export function createOverlay(root: HTMLElement, onRestart: () => void): {
  update(snapshot: GameSnapshot): void;
} {
  const overlay = root.querySelector<HTMLElement>("#overlay");
  const linesEl = root.querySelector<HTMLElement>("#overlay-lines");
  const restartBtn = root.querySelector<HTMLButtonElement>("#restart");

  restartBtn?.addEventListener("click", () => {
    onRestart();
  });

  function update(snapshot: GameSnapshot): void {
    if (!overlay) return;
    if (snapshot.gameOver) {
      overlay.classList.remove("hidden");
      if (linesEl) {
        linesEl.textContent = String(snapshot.linesClearedTotal);
      }
    } else {
      overlay.classList.add("hidden");
    }
  }

  return { update };
}
