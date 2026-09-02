import type { GameSnapshot } from "../engine";
import {
  addHighscore,
  loadHighscores,
  qualifiesForHighscore,
  sanitizeName,
  type HighscoreEntry,
} from "./highscore";

function renderList(listEl: HTMLElement, entries: HighscoreEntry[]): void {
  listEl.replaceChildren();
  for (const entry of entries) {
    const li = document.createElement("li");
    const date = entry.date.slice(0, 10);
    li.textContent = `${entry.name}  ${entry.score}  Lv${entry.level}  ${entry.lines}L  ${date}`;
    listEl.appendChild(li);
  }
  if (entries.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Noch keine Einträge";
    listEl.appendChild(li);
  }
}

export function createOverlay(root: HTMLElement, onRestart: () => void): {
  update(snapshot: GameSnapshot): void;
} {
  const overlay = root.querySelector<HTMLElement>("#overlay");
  const linesEl = root.querySelector<HTMLElement>("#overlay-lines");
  const scoreEl = root.querySelector<HTMLElement>("#overlay-score");
  const form = root.querySelector<HTMLFormElement>("#highscore-form");
  const nameInput = root.querySelector<HTMLInputElement>("#highscore-name");
  const listEl = root.querySelector<HTMLElement>("#highscore-list");
  const restartBtn = root.querySelector<HTMLButtonElement>("#restart");

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
    if (listEl) renderList(listEl, loadHighscores());
  }

  restartBtn?.addEventListener("click", () => {
    savePending();
    onRestart();
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
      if (listEl) renderList(listEl, loadHighscores());
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
