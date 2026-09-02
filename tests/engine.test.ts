import { describe, expect, it } from "vitest";
import {
  createGame,
  emptyGrid,
  type Grid,
} from "../src/engine";

function cells(g: ReturnType<typeof createGame>) {
  const active = g.getSnapshot().active;
  if (!active) {
    throw new Error("expected an active piece");
  }
  return active.cells.slice().sort((a, b) => a.y - b.y || a.x - b.x);
}

function cellKey(c: { x: number; y: number }): string {
  return `${c.x},${c.y}`;
}

describe("collision", () => {
  it("cannot move through walls", () => {
    const game = createGame({ bag: ["I", "T"] });
    for (let i = 0; i < 20; i++) {
      game.dispatch("left");
    }
    const leftXs = cells(game).map((c) => c.x);
    expect(Math.min(...leftXs)).toBe(0);

    for (let i = 0; i < 20; i++) {
      game.dispatch("right");
    }
    const rightXs = cells(game).map((c) => c.x);
    expect(Math.max(...rightXs)).toBe(9);
  });

  it("cannot move through locked cells", () => {
    const grid = emptyGrid();
    grid[1]![2] = "O";
    const game = createGame({ bag: ["T", "I"], grid });
    const xBefore = game.getSnapshot().active?.x;
    game.dispatch("left");
    expect(game.getSnapshot().active?.x).toBe(xBefore);
  });
});

describe("hard drop", () => {
  it("locks on the floor", () => {
    const game = createGame({ bag: ["O", "T"] });
    game.dispatch("hard");
    const snap = game.getSnapshot();
    expect(snap.grid[21]![4]).toBe("O");
    expect(snap.grid[21]![5]).toBe("O");
    expect(snap.grid[20]![4]).toBe("O");
    expect(snap.grid[20]![5]).toBe("O");
    expect(snap.active?.type).toBe("T");
    expect(snap.gameOver).toBe(false);
  });

  it("locks on a stack", () => {
    const game = createGame({ bag: ["O", "T", "I"] });
    game.dispatch("hard");
    game.dispatch("hard");
    const snap = game.getSnapshot();
    const tCells: string[] = [];
    for (let y = 0; y < snap.rows; y++) {
      for (let x = 0; x < snap.cols; x++) {
        if (snap.grid[y]![x] === "T") {
          tCells.push(`${x},${y}`);
        }
      }
    }
    expect(tCells.length).toBe(4);
    expect(tCells.some((k) => k.endsWith(",19"))).toBe(true);
    expect(snap.grid[20]![4]).toBe("O");
    expect(snap.active?.type).toBe("I");
  });
});

describe("line clear", () => {
  it("clears a full row and drops the stack above", () => {
    const grid = emptyGrid();
    for (let x = 1; x < 10; x++) {
      grid[21]![x] = "Z";
    }
    grid[20]![9] = "T";
    const game = createGame({ bag: ["I", "O"], grid });
    game.dispatch("cw");
    for (let i = 0; i < 6; i++) {
      game.dispatch("left");
    }
    game.dispatch("hard");
    const snap = game.getSnapshot();
    expect(snap.linesClearedTotal).toBe(1);
    expect(snap.lastClearCount).toBe(1);
    expect(snap.grid[21]![9]).toBe("T");
    expect(snap.grid[21]![0]).toBe("I");
    expect(snap.grid[21]!.every((c) => c !== "Z")).toBe(true);
  });
});

describe("game over", () => {
  it("spawn onto a blocked top is game over", () => {
    const grid = emptyGrid();
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 10; x++) {
        grid[y]![x] = "I";
      }
    }
    const game = createGame({ bag: ["T"], grid });
    expect(game.getSnapshot().gameOver).toBe(true);
  });
});

describe("gravity", () => {
  it("moves down 1 if free, else starts lock", () => {
    const game = createGame({
      bag: ["O", "T"],
      gravityMs: 800,
      lockMs: 500,
    });
    const y0 = game.getSnapshot().active?.y ?? -1;
    game.dispatch("tick", 799);
    expect(game.getSnapshot().active?.y).toBe(y0);
    expect(game.getSnapshot().locking).toBe(false);

    game.dispatch("tick", 1);
    expect(game.getSnapshot().active?.y).toBe(y0 + 1);
    expect(game.getSnapshot().locking).toBe(false);

    const grounded = createGame({
      bag: ["O", "T"],
      gravityMs: 100,
      lockMs: 500,
    });
    for (let i = 0; i < 20; i++) {
      grounded.dispatch("tick", 100);
    }
    expect(grounded.getSnapshot().active?.y).toBe(20);
    expect(grounded.getSnapshot().locking).toBe(false);

    grounded.dispatch("tick", 100);
    expect(grounded.getSnapshot().active?.y).toBe(20);
    expect(grounded.getSnapshot().locking).toBe(true);
    expect(grounded.getSnapshot().grid[21]![4]).toBeNull();

    grounded.dispatch("tick", 499);
    expect(grounded.getSnapshot().locking).toBe(true);
    expect(grounded.getSnapshot().active?.type).toBe("O");

    grounded.dispatch("tick", 1);
    expect(grounded.getSnapshot().grid[21]![4]).toBe("O");
    expect(grounded.getSnapshot().active?.type).toBe("T");
  });
});

describe("rotation", () => {
  it("CW rotate of T changes occupancy; blocked rotate is rejected without kick", () => {
    const game = createGame({ bag: ["T", "I"] });
    const before = cells(game).map(cellKey);
    const rot0 = game.getSnapshot().active?.rotation;
    game.dispatch("cw");
    const after = cells(game).map(cellKey);
    expect(game.getSnapshot().active?.rotation).toBe(((rot0 ?? 0) + 1) % 4);
    expect(after).not.toEqual(before);

    const grid: Grid = emptyGrid();
    grid[2]![4] = "I";
    const blocked = createGame({ bag: ["T", "I"], grid });
    blocked.dispatch("cw");
    expect(blocked.getSnapshot().active?.rotation).toBe(0);
    expect(cells(blocked).map(cellKey)).toEqual(before);
  });
});

describe("restart", () => {
  it("resets a playable game", () => {
    const playable = createGame({ bag: ["I", "O"] });
    playable.dispatch("hard");
    playable.dispatch("restart");
    expect(playable.getSnapshot().gameOver).toBe(false);
    expect(playable.getSnapshot().active?.type).toBe("I");
    expect(playable.getSnapshot().linesClearedTotal).toBe(0);
  });
});
