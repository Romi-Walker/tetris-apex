import { fillHighscoreList, loadHighscores } from "./highscore";

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
  },
): {
  get(): ScreenKey;
  set(screen: ScreenKey): void;
  handleEscape(): void;
  handleEnter(): void;
} {
  let current: ScreenKey = "title";

  const screenTitle = root.querySelector<HTMLElement>("#screen-title");
  const screenHowto = root.querySelector<HTMLElement>("#screen-howto");
  const screenSettings = root.querySelector<HTMLElement>("#screen-settings");
  const screenHighscores = root.querySelector<HTMLElement>("#screen-highscores");
  const screenPlay = root.querySelector<HTMLElement>("#screen-play");
  const overlayPause = root.querySelector<HTMLElement>("#overlay-pause");
  const highscoreList = root.querySelector<HTMLElement>("#title-highscore-list");

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
  }

  function set(screen: ScreenKey): void {
    current = screen;
    apply();
  }

  root.querySelector("#btn-play")?.addEventListener("click", () => handlers.onPlay());
  root.querySelector("#btn-howto")?.addEventListener("click", () => set("howto"));
  root.querySelector("#btn-settings")?.addEventListener("click", () => set("settings"));
  root.querySelector("#btn-highscores")?.addEventListener("click", () => set("highscores"));

  for (const id of ["btn-howto-back", "btn-settings-back", "btn-highscores-back"]) {
    root.querySelector(`#${id}`)?.addEventListener("click", () => set("title"));
  }

  root.querySelector("#btn-resume")?.addEventListener("click", () => handlers.onResume());
  root.querySelector("#btn-pause-title")?.addEventListener("click", () => handlers.onTitle());

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
    if (current === "title") handlers.onPlay();
  }

  apply();
  return { get: () => current, set, handleEscape, handleEnter };
}
