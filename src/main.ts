import { createAudio } from "./audio";
import { createGame } from "./engine";
import { createKeyboard } from "./input/keyboard";
import { createTouch } from "./input/touch";
import { createRenderer } from "./render/canvasRenderer";
import {
  applyColorblind,
  applyPaletteCss,
  createThemeController,
} from "./theme";
import { createHud } from "./ui/hud";
import { createOverlay } from "./ui/overlay";
import { createScreens } from "./ui/screens";
import { bindSettingsForm } from "./ui/settingsForm";
import { browserStorage, type GameSettings } from "./ui/settings";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#board");
if (!canvas) {
  throw new Error("#board canvas missing");
}

const storage = browserStorage() ?? {
  getItem: () => null,
  setItem: () => undefined,
};

const game = createGame();
const renderer = createRenderer(canvas);
const hud = createHud(document.body);
const theme = createThemeController();
const audio = createAudio();
let settings: GameSettings | null = null;
let lastThemeId = theme.currentId();

function currentSettings(): GameSettings {
  return settings ?? bind.get();
}

function applySettings(next: GameSettings): void {
  settings = next;
  game.setDasMs(next.dasMs);
  game.setArrMs(next.arrMs);
  audio.setMute(next.mute);
  audio.setMasterVolume(next.masterVolume);
  audio.setSfxVolume(next.sfxVolume);
  audio.setMusicVolume(next.musicVolume);
  theme.setReduceMotion(next.reduceMotion);
}

function releaseKeys(): void {
  game.dispatch("leftUp");
  game.dispatch("rightUp");
  game.dispatch("softUp");
}

function toggleFullscreen(): void {
  const root = document.querySelector("#app-root") ?? document.documentElement;
  try {
    if (!document.fullscreenElement) {
      void root.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  } catch {
    // ignore permission / iframe failures
  }
}

function startPlay(): void {
  audio.unlock();
  theme.reset();
  lastThemeId = theme.currentId();
  const s = currentSettings();
  applySettings(s);
  game.dispatch("restart");
  audio.setTheme(theme.currentId(), theme.palette(), true);
  audio.startMusic();
  screens.set("play");
}

const bind = bindSettingsForm(document.body, storage, {
  onChange: applySettings,
  onFullscreen: toggleFullscreen,
});

const screens = createScreens(document.body, {
  onPlay: startPlay,
  onResume: () => screens.set("play"),
  onTitle: () => {
    releaseKeys();
    audio.stopMusic();
    screens.set("title");
  },
  onPause: () => {
    if (game.getSnapshot().gameOver) {
      screens.set("gameover");
      return;
    }
    releaseKeys();
    screens.set("pause");
  },
  onSettingsOpen: () => bind.refresh(),
});

const overlay = createOverlay(document.body, {
  onRestart: startPlay,
  onTitle: () => {
    releaseKeys();
    audio.stopMusic();
    screens.set("title");
  },
});

function playDispatch(action: Parameters<typeof game.dispatch>[0]): void {
  if (action === "restart") {
    startPlay();
    return;
  }
  game.dispatch(action);
}

const input = createKeyboard({
  dispatch(action) {
    audio.unlock();
    const screen = screens.get();
    if (screen === "play") {
      playDispatch(action);
      return;
    }
    if (screen === "gameover" && action === "restart") {
      startPlay();
    }
  },
  onEscape() {
    screens.handleEscape();
  },
  onEnter() {
    audio.unlock();
    screens.handleEnter();
  },
  getRemap: () => currentSettings().remap,
  capturing: () => bind.capturing(),
});
input.attach();

const touch = createTouch(document.body, {
  dispatch(action) {
    if (screens.get() !== "play") return;
    audio.unlock();
    playDispatch(action);
  },
  enabled: () => screens.get() === "play",
});
touch.attach();

applyPaletteCss(theme.palette(), document.documentElement);
audio.setTheme(theme.currentId(), theme.palette(), true);

let last = performance.now();

function frame(now: number): void {
  const dt = Math.min(50, now - last);
  last = now;
  const screen = screens.get();
  const s = currentSettings();
  if (screen === "play") {
    game.dispatch("tick", dt);
  }
  const events = game.consumeEvents();
  audio.handleEvents(events);
  const snapshot = game.getSnapshot();
  if (snapshot.gameOver && screen === "play") {
    screens.set("gameover");
  }
  theme.observe(snapshot);
  const themeId = theme.currentId();
  if (themeId !== lastThemeId) {
    lastThemeId = themeId;
    audio.setTheme(themeId, theme.palette(now), s.reduceMotion);
  }
  const palette = applyColorblind(theme.palette(now), s.colorblind);
  applyPaletteCss(palette, document.documentElement);
  if (screen === "play" || screen === "pause" || screen === "gameover") {
    renderer.draw(snapshot, palette, now, {
      ghost: s.ghost,
      grid: s.grid,
      reduceMotion: s.reduceMotion,
      highContrast: s.colorblind === "high-contrast",
    });
    hud.update(snapshot, palette);
  }
  overlay.update(snapshot);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

window.addEventListener(
  "pointerdown",
  () => {
    audio.unlock();
  },
  { once: false },
);
