import type { Action } from "../engine";

export interface KeyboardInput {
  attach(): void;
  detach(): void;
  isSoftDropHeld(): boolean;
}

export function createKeyboard(handlers: {
  dispatch(action: Exclude<Action, "tick" | "soft">): void;
}): KeyboardInput {
  const held = new Set<string>();

  function onKeyDown(event: KeyboardEvent): void {
    const { code } = event;
    if (
      code === "ArrowLeft" ||
      code === "ArrowRight" ||
      code === "ArrowDown" ||
      code === "ArrowUp" ||
      code === "Space"
    ) {
      event.preventDefault();
    }
    if (event.repeat) return;

    switch (code) {
      case "ArrowLeft":
        handlers.dispatch("left");
        break;
      case "ArrowRight":
        handlers.dispatch("right");
        break;
      case "ArrowDown":
        held.add(code);
        break;
      case "ArrowUp":
      case "KeyX":
        handlers.dispatch("cw");
        break;
      case "Space":
        handlers.dispatch("hard");
        break;
      case "KeyR":
        handlers.dispatch("restart");
        break;
      default:
        break;
    }
  }

  function onKeyUp(event: KeyboardEvent): void {
    held.delete(event.code);
  }

  function onBlur(): void {
    held.clear();
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

  return {
    attach,
    detach,
    isSoftDropHeld(): boolean {
      return held.has("ArrowDown");
    },
  };
}
