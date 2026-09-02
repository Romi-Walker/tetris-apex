import { createGame } from "./engine";
import { createKeyboard } from "./input/keyboard";
import { createRenderer } from "./render/canvasRenderer";
import { createHud } from "./ui/hud";
import { createOverlay } from "./ui/overlay";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#board");
if (!canvas) {
  throw new Error("#board canvas missing");
}

const game = createGame();
const renderer = createRenderer(canvas);
const hud = createHud(document.body);
const overlay = createOverlay(document.body, () => {
  game.dispatch("restart");
});

const input = createKeyboard({
  dispatch(action) {
    game.dispatch(action);
  },
});
input.attach();

let last = performance.now();

function frame(now: number): void {
  const dt = Math.min(50, now - last);
  last = now;
  game.dispatch("tick", dt);
  const snapshot = game.getSnapshot();
  renderer.draw(snapshot);
  hud.update(snapshot);
  overlay.update(snapshot);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
