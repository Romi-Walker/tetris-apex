import { createGame } from "./engine";
import { createKeyboard } from "./input/keyboard";
import { createRenderer } from "./render/canvasRenderer";
import { createOverlay } from "./ui/overlay";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#board");
if (!canvas) {
  throw new Error("#board canvas missing");
}

const game = createGame();
const renderer = createRenderer(canvas);
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
  if (input.isSoftDropHeld()) {
    game.dispatch("soft");
  }
  game.dispatch("tick", dt);
  const snapshot = game.getSnapshot();
  renderer.draw(snapshot);
  overlay.update(snapshot);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
