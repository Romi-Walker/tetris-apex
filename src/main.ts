import { createGame } from "./engine";
import { createKeyboard } from "./input/keyboard";
import { createRenderer } from "./render/canvasRenderer";
import { applyPaletteCss, createThemeController } from "./theme";
import { createHud } from "./ui/hud";
import { createOverlay } from "./ui/overlay";
import { createScreens } from "./ui/screens";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#board");
if (!canvas) {
  throw new Error("#board canvas missing");
}

const game = createGame();
const renderer = createRenderer(canvas);
const hud = createHud(document.body);
const theme = createThemeController();

function releaseKeys(): void {
  game.dispatch("leftUp");
  game.dispatch("rightUp");
  game.dispatch("softUp");
}

function startPlay(): void {
  game.dispatch("restart");
  screens.set("play");
}

const screens = createScreens(document.body, {
  onPlay: startPlay,
  onResume: () => screens.set("play"),
  onTitle: () => {
    releaseKeys();
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
});

const overlay = createOverlay(document.body, {
  onRestart: () => {
    game.dispatch("restart");
    screens.set("play");
  },
  onTitle: () => {
    releaseKeys();
    screens.set("title");
  },
});

const input = createKeyboard({
  dispatch(action) {
    const screen = screens.get();
    if (screen === "play") {
      game.dispatch(action);
      return;
    }
    if (screen === "gameover" && action === "restart") {
      game.dispatch("restart");
      screens.set("play");
    }
  },
  onEscape() {
    screens.handleEscape();
  },
  onEnter() {
    screens.handleEnter();
  },
});
input.attach();

applyPaletteCss(theme.palette(), document.documentElement);

let last = performance.now();

function frame(now: number): void {
  const dt = Math.min(50, now - last);
  last = now;
  const screen = screens.get();
  if (screen === "play") {
    game.dispatch("tick", dt);
  }
  const snapshot = game.getSnapshot();
  if (snapshot.gameOver && screen === "play") {
    screens.set("gameover");
  }
  theme.observe(snapshot);
  const palette = theme.palette(now);
  applyPaletteCss(palette, document.documentElement);
  if (screen === "play" || screen === "pause" || screen === "gameover") {
    renderer.draw(snapshot, palette, now);
    hud.update(snapshot, palette);
  }
  overlay.update(snapshot);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
