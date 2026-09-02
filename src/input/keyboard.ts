import type { Action } from "../engine";

export type InputAction = Exclude<Action, "tick">;

export interface KeyboardInput {
  attach(): void;
  detach(): void;
}

const PREVENT = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "ArrowUp",
  "Space",
  "KeyZ",
  "KeyX",
  "KeyA",
  "KeyC",
  "KeyR",
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "ControlRight",
]);

export function createKeyboard(handlers: {
  dispatch(action: InputAction): void;
}): KeyboardInput {
  function onKeyDown(event: KeyboardEvent): void {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }
    const { code } = event;
    if (PREVENT.has(code)) {
      event.preventDefault();
    }
    if (event.repeat) return;

    switch (code) {
      case "ArrowLeft":
        handlers.dispatch("leftDown");
        break;
      case "ArrowRight":
        handlers.dispatch("rightDown");
        break;
      case "ArrowDown":
        handlers.dispatch("softDown");
        break;
      case "ArrowUp":
      case "KeyX":
        handlers.dispatch("cw");
        break;
      case "KeyZ":
      case "ControlLeft":
      case "ControlRight":
        handlers.dispatch("ccw");
        break;
      case "KeyA":
        handlers.dispatch("flip");
        break;
      case "Space":
        handlers.dispatch("hard");
        break;
      case "KeyC":
      case "ShiftLeft":
      case "ShiftRight":
        handlers.dispatch("hold");
        break;
      case "KeyR":
        handlers.dispatch("restart");
        break;
      default:
        break;
    }
  }

  function onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case "ArrowLeft":
        handlers.dispatch("leftUp");
        break;
      case "ArrowRight":
        handlers.dispatch("rightUp");
        break;
      case "ArrowDown":
        handlers.dispatch("softUp");
        break;
      default:
        break;
    }
  }

  function onBlur(): void {
    handlers.dispatch("leftUp");
    handlers.dispatch("rightUp");
    handlers.dispatch("softUp");
  }

  function attach(): void {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  }

  function detach(): void {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  }

  return { attach, detach };
}
