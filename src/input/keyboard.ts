import type { Action } from "../engine";
import {
  resolveControl,
  type ControlId,
  type KeyRemap,
} from "../ui/settings";

export type InputAction = Exclude<Action, "tick">;

export interface KeyboardInput {
  attach(): void;
  detach(): void;
}

const ALWAYS_PREVENT = new Set(["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"]);

function controlToDown(id: ControlId): InputAction | "pause" | null {
  switch (id) {
    case "left":
      return "leftDown";
    case "right":
      return "rightDown";
    case "soft":
      return "softDown";
    case "hard":
      return "hard";
    case "cw":
      return "cw";
    case "ccw":
      return "ccw";
    case "flip":
      return "flip";
    case "hold":
      return "hold";
    case "pause":
      return "pause";
  }
}

function controlToUp(id: ControlId): InputAction | null {
  switch (id) {
    case "left":
      return "leftUp";
    case "right":
      return "rightUp";
    case "soft":
      return "softUp";
    default:
      return null;
  }
}

export function createKeyboard(handlers: {
  dispatch(action: InputAction): void;
  onEscape?: () => void;
  onEnter?: () => void;
  getRemap?: () => KeyRemap;
  capturing?: () => boolean;
}): KeyboardInput {
  function remap(): KeyRemap {
    return handlers.getRemap?.() ?? {};
  }

  function onKeyDown(event: KeyboardEvent): void {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }
    if (handlers.capturing?.()) {
      event.preventDefault();
      return;
    }
    const { code } = event;
    const control = resolveControl(code, remap());
    if (ALWAYS_PREVENT.has(code) || code === "Enter" || control) {
      event.preventDefault();
    }
    if (event.repeat) return;

    if (code === "Enter") {
      handlers.onEnter?.();
      return;
    }

    if (code === "KeyR") {
      handlers.dispatch("restart");
      return;
    }

    if (!control) {
      if (code === "Escape") handlers.onEscape?.();
      return;
    }

    const action = controlToDown(control);
    if (action === "pause") {
      handlers.onEscape?.();
      return;
    }
    if (action) handlers.dispatch(action);
  }

  function onKeyUp(event: KeyboardEvent): void {
    if (handlers.capturing?.()) return;
    const control = resolveControl(event.code, remap());
    if (!control) return;
    const action = controlToUp(control);
    if (action) handlers.dispatch(action);
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
