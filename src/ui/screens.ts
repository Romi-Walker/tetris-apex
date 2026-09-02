import { fillHighscoreList, loadHighscores } from "./highscore";
import { HOWTO_CARDS } from "./howto";
import {
  browserStorage,
  loadHowtoSeen,
  saveHowtoSeen,
} from "./settings";

export type ScreenKey =
  | "title"
  | "play"
  | "pause"
  | "gameover"
  | "settings"
  | "howto"
  | "highscores";

const MENU_SCREENS: ScreenKey[] = ["title", "howto", "settings", "highscores"];

export function createScreens(
  root: HTMLElement,
  handlers: {
    onPlay: () => void;
    onResume: () => void;
    onTitle: () => void;
    onPause: () => void;
    onSettingsOpen?: () => void;
  },
): {
  get(): ScreenKey;
  set(screen: ScreenKey): void;
  handleEscape(): void;
  handleEnter(): void;
} {
  let current: ScreenKey = "title";
  let howtoIndex = 0;

  const screenTitle = root.querySelector<HTMLElement>("#screen-title");
  const screenHowto = root.querySelector<HTMLElement>("#screen-howto");
  const screenSettings = root.querySelector<HTMLElement>("#screen-settings");
  const screenHighscores = root.querySelector<HTMLElement>("#screen-highscores");
  const screenPlay = root.querySelector<HTMLElement>("#screen-play");
  const overlayPause = root.querySelector<HTMLElement>("#overlay-pause");
  const highscoreList = root.querySelector<HTMLElement>("#title-highscore-list");
  const firstRun = root.querySelector<HTMLElement>("#first-run");
  const howtoTitle = root.querySelector<HTMLElement>("#howto-title");
  const howtoBody = root.querySelector<HTMLElement>("#howto-body");
  const howtoSkip = root.querySelector<HTMLButtonElement>("#btn-howto-skip");
  const howtoNext = root.querySelector<HTMLButtonElement>("#btn-howto-next");
  const howtoDone = root.querySelector<HTMLButtonElement>("#btn-howto-done");
  const firstTitle = root.querySelector<HTMLElement>("#first-run-title");
  const firstBody = root.querySelector<HTMLElement>("#first-run-body");
  const firstSkip = root.querySelector<HTMLButtonElement>("#btn-first-skip");
  const firstNext = root.querySelector<HTMLButtonElement>("#btn-first-next");
  const firstDone = root.querySelector<HTMLButtonElement>("#btn-first-done");
  const firstPlay = root.querySelector<HTMLButtonElement>("#btn-first-play");

  const storage = browserStorage();
  let firstIndex = 0;

  function paintHowto(index: number, titleEl: HTMLElement | null, bodyEl: HTMLElement | null, nextBtn: HTMLButtonElement | null, doneBtn: HTMLButtonElement | null): void {
    const card = HOWTO_CARDS[index] ?? HOWTO_CARDS[0]!;
    if (titleEl) titleEl.textContent = card.title;
    if (bodyEl) bodyEl.textContent = card.body;
    const last = index >= HOWTO_CARDS.length - 1;
    nextBtn?.classList.toggle("hidden", last);
    doneBtn?.classList.toggle("hidden", !last);
  }

  function apply(): void {
    const playVisible =
      current === "play" || current === "pause" || current === "gameover";
    screenTitle?.classList.toggle("hidden", current !== "title");
    screenHowto?.classList.toggle("hidden", current !== "howto");
    screenSettings?.classList.toggle("hidden", current !== "settings");
    screenHighscores?.classList.toggle("hidden", current !== "highscores");
    screenPlay?.classList.toggle("hidden", !playVisible);
    overlayPause?.classList.toggle("hidden", current !== "pause");
    root.dataset.screen = current;
    if (current === "highscores" && highscoreList) {
      fillHighscoreList(highscoreList, loadHighscores());
    }
    if (current === "howto") {
      paintHowto(howtoIndex, howtoTitle, howtoBody, howtoNext, howtoDone);
    }
    if (current === "settings") {
      handlers.onSettingsOpen?.();
    }
  }

  function set(screen: ScreenKey): void {
    current = screen;
    if (screen === "howto") howtoIndex = 0;
    apply();
  }

  function dismissFirstRun(): void {
    if (storage) saveHowtoSeen(storage, true);
    firstRun?.classList.add("hidden");
  }

  function paintFirst(): void {
    paintHowto(firstIndex, firstTitle, firstBody, firstNext, firstDone);
  }

  root.querySelector("#btn-play")?.addEventListener("click", () => {
    dismissFirstRun();
    handlers.onPlay();
  });
  root.querySelector("#btn-howto")?.addEventListener("click", () => set("howto"));
  root.querySelector("#btn-settings")?.addEventListener("click", () => set("settings"));
  root.querySelector("#btn-highscores")?.addEventListener("click", () => set("highscores"));

  howtoSkip?.addEventListener("click", () => set("title"));
  howtoNext?.addEventListener("click", () => {
    howtoIndex = Math.min(HOWTO_CARDS.length - 1, howtoIndex + 1);
    paintHowto(howtoIndex, howtoTitle, howtoBody, howtoNext, howtoDone);
  });
  howtoDone?.addEventListener("click", () => {
    if (storage) saveHowtoSeen(storage, true);
    set("title");
  });
  root.querySelector("#btn-howto-back")?.addEventListener("click", () => set("title"));

  for (const id of ["btn-settings-back", "btn-highscores-back"]) {
    root.querySelector(`#${id}`)?.addEventListener("click", () => set("title"));
  }

  root.querySelector("#btn-resume")?.addEventListener("click", () => handlers.onResume());
  root.querySelector("#btn-pause-title")?.addEventListener("click", () => handlers.onTitle());

  firstSkip?.addEventListener("click", () => dismissFirstRun());
  firstNext?.addEventListener("click", () => {
    firstIndex = Math.min(HOWTO_CARDS.length - 1, firstIndex + 1);
    paintFirst();
  });
  firstDone?.addEventListener("click", () => dismissFirstRun());
  firstPlay?.addEventListener("click", () => {
    dismissFirstRun();
    handlers.onPlay();
  });

  if (storage && !loadHowtoSeen(storage) && firstRun) {
    firstRun.classList.remove("hidden");
    paintFirst();
  } else {
    firstRun?.classList.add("hidden");
  }

  function handleEscape(): void {
    if (current === "play") {
      handlers.onPause();
      return;
    }
    if (current === "pause") {
      handlers.onResume();
      return;
    }
    if (MENU_SCREENS.includes(current) && current !== "title") {
      set("title");
    }
  }

  function handleEnter(): void {
    if (current === "title") {
      dismissFirstRun();
      handlers.onPlay();
    }
  }

  apply();
  return { get: () => current, set, handleEscape, handleEnter };
}
