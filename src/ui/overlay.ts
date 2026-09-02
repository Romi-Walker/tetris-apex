import type { GameSnapshot } from "../engine";
import {
  addHighscore,
  fillHighscoreList,
  loadHighscores,
  qualifiesForHighscore,
  sanitizeName,
} from "./highscore";

export function createOverlay(
  root: HTMLElement,
  handlers: {
    onRestart: () => void;
    onTitle: () => void;
  },
): {
  update(snapshot: GameSnapshot): void;
} {
  const overlay = root.querySelector<HTMLElement>("#overlay");
  const linesEl = root.querySelector<HTMLElement>("#overlay-lines");
  const scoreEl = root.querySelector<HTMLElement>("#overlay-score");
  const form = root.querySelector<HTMLFormElement>("#highscore-form");
  const nameInput = root.querySelector<HTMLInputElement>("#highscore-name");
  const listEl = root.querySelector<HTMLElement>("#highscore-list");
  const restartBtn = root.querySelector<HTMLButtonElement>("#restart");
  const titleBtn = root.querySelector<HTMLButtonElement>("#btn-gameover-title");

  let lastGameOver = false;
  let submitted = false;
  let pending: GameSnapshot | null = null;

  function savePending(): void {
    if (!pending || submitted) return;
    if (!qualifiesForHighscore(pending.score)) return;
    addHighscore({
      name: sanitizeName(nameInput?.value ?? "AAA"),
      score: pending.score,
      level: pending.level,
      lines: pending.linesClearedTotal,
    });
    submitted = true;
    if (form) form.classList.add("hidden");
    if (listEl) fillHighscoreList(listEl, loadHighscores());
  }

  restartBtn?.addEventListener("click", () => {
    savePending();
    handlers.onRestart();
  });

  titleBtn?.addEventListener("click", () => {
    savePending();
    handlers.onTitle();
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    savePending();
  });

  function update(snapshot: GameSnapshot): void {
    if (!overlay) return;
    if (snapshot.gameOver) {
      overlay.classList.remove("hidden");
      if (scoreEl) scoreEl.textContent = String(snapshot.score);
      if (linesEl) linesEl.textContent = String(snapshot.linesClearedTotal);
      if (!lastGameOver) {
        submitted = false;
        pending = snapshot;
        const qualifies = qualifiesForHighscore(snapshot.score);
        if (form) form.classList.toggle("hidden", !qualifies);
        if (nameInput) {
          nameInput.value = "AAA";
          if (qualifies) nameInput.focus();
        }
      }
      if (listEl) fillHighscoreList(listEl, loadHighscores());
      lastGameOver = true;
    } else {
      if (lastGameOver) savePending();
      overlay.classList.add("hidden");
      lastGameOver = false;
      pending = null;
      submitted = false;
    }
  }

  return { update };
}
