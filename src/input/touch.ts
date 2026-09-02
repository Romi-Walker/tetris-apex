import type { InputAction } from "./keyboard";

export interface TouchInput {
  attach(): void;
  detach(): void;
}

const HOLD_IDS = new Set(["left", "right", "soft"]);

function actionFor(id: string, phase: "down" | "up"): InputAction | null {
  if (id === "left") return phase === "down" ? "leftDown" : "leftUp";
  if (id === "right") return phase === "down" ? "rightDown" : "rightUp";
  if (id === "soft") return phase === "down" ? "softDown" : "softUp";
  if (phase === "up") return null;
  if (id === "cw" || id === "rotate") return "cw";
  if (id === "hard") return "hard";
  if (id === "hold") return "hold";
  if (id === "ccw") return "ccw";
  return null;
}

export function createTouch(
  root: HTMLElement,
  handlers: { dispatch(action: InputAction): void; enabled?: () => boolean },
): TouchInput {
  const held = new Map<number, string>();
  let swipeStartY: number | null = null;
  let swipeStartX: number | null = null;
  let swipeId: number | null = null;

  function enabled(): boolean {
    return handlers.enabled?.() ?? true;
  }

  function down(event: PointerEvent): void {
    if (!enabled()) return;
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    const id = el.dataset.touch;
    if (!id) return;
    event.preventDefault();
    el.setPointerCapture?.(event.pointerId);
    held.set(event.pointerId, id);
    const action = actionFor(id, "down");
    if (action) handlers.dispatch(action);
  }

  function up(event: PointerEvent): void {
    const id = held.get(event.pointerId);
    if (!id) return;
    held.delete(event.pointerId);
    if (HOLD_IDS.has(id)) {
      const action = actionFor(id, "up");
      if (action) handlers.dispatch(action);
    }
  }

  function boardDown(event: PointerEvent): void {
    if (!enabled()) return;
    swipeStartY = event.clientY;
    swipeStartX = event.clientX;
    swipeId = event.pointerId;
  }

  function boardUp(event: PointerEvent): void {
    if (swipeId !== event.pointerId || swipeStartY === null || swipeStartX === null) {
      swipeStartY = null;
      swipeStartX = null;
      swipeId = null;
      return;
    }
    if (!enabled()) {
      swipeStartY = null;
      swipeStartX = null;
      swipeId = null;
      return;
    }
    const dy = event.clientY - swipeStartY;
    const dx = event.clientX - swipeStartX;
    swipeStartY = null;
    swipeStartX = null;
    swipeId = null;
    if (dy > 48 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      handlers.dispatch("hard");
      return;
    }
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
      handlers.dispatch("cw");
    }
  }

  function attach(): void {
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    const layer = root.querySelector<HTMLElement>("#touch-board-layer");
    layer?.addEventListener("pointerdown", boardDown);
    layer?.addEventListener("pointerup", boardUp);
    layer?.addEventListener("pointercancel", boardUp);
  }

  function detach(): void {
    root.removeEventListener("pointerdown", down);
    root.removeEventListener("pointerup", up);
    root.removeEventListener("pointercancel", up);
    handlers.dispatch("leftUp");
    handlers.dispatch("rightUp");
    handlers.dispatch("softUp");
  }

  return { attach, detach };
}
