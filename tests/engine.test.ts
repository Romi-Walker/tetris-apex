import { describe, expect, it } from "vitest";
import {
  createGame,
  createBagRandomizer,
  emptyGrid,
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
    for (let i = 0; i < 19; i++) {
      game.dispatch("left");
    }
    const leftXs = cells(game).map((c) => c.x);
    expect(Math.min(...leftXs)).toBe(0);

    for (let i = 0; i < 19; i++) {
      game.dispatch("right");
    }
    const rightXs = cells(game).map((c) => c.x);
    expect(Math.max(...rightXs)).toBe(9);
  });

  it("cannot move through locked cells", () => {
    const grid = emptyGrid();
    grid[2]![2] = "O";
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
    for (let i = 0; i < 19; i++) {
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
  it("CW rotate of T changes occupancy", () => {
    const game = createGame({ bag: ["T", "I"] });
    const before = cells(game).map(cellKey);
    const rot0 = game.getSnapshot().active?.rotation;
    game.dispatch("cw");
    const after = cells(game).map(cellKey);
    expect(game.getSnapshot().active?.rotation).toBe(((rot0 ?? 0) + 1) % 4);
    expect(after).not.toEqual(before);
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


const ALL = ["I", "J", "L", "O", "S", "T", "Z"] as const;

describe("SRS kicks", () => {
  it("rotation against a wall succeeds via SRS kick", () => {
    const game = createGame({ bag: ["T", "I"], gravityMs: 1e9 });
    game.dispatch("ccw");
    expect(game.getSnapshot().active?.rotation).toBe(3);
    for (let i = 0; i < 10; i++) {
      game.dispatch("right");
    }
    const before = game.getSnapshot().active;
    expect(before?.x).toBe(8);
    game.dispatch("cw");
    const after = game.getSnapshot().active;
    expect(after?.rotation).toBe(0);
    expect(after?.x).toBe((before?.x ?? 0) - 1);
  });

  it("rotation is rejected when no kick fits", () => {
    const grid = emptyGrid();
    for (let y = 0; y < 22; y++) {
      for (let x = 0; x < 10; x++) {
        grid[y]![x] = "I";
      }
    }
    grid[1]![4] = null;
    grid[2]![3] = null;
    grid[2]![4] = null;
    grid[2]![5] = null;
    const game = createGame({ bag: ["T"], grid, gravityMs: 1e9 });
    expect(game.getSnapshot().gameOver).toBe(false);
    expect(game.getSnapshot().active?.rotation).toBe(0);
    game.dispatch("cw");
    expect(game.getSnapshot().active?.rotation).toBe(0);
    game.dispatch("ccw");
    expect(game.getSnapshot().active?.rotation).toBe(0);
    expect(cells(game).map(cellKey)).toEqual(["4,1", "3,2", "4,2", "5,2"]);
  });

  it("180 rotate changes occupancy", () => {
    const game = createGame({ bag: ["T", "I"], gravityMs: 1e9 });
    const before = cells(game).map(cellKey);
    game.dispatch("flip");
    expect(game.getSnapshot().active?.rotation).toBe(2);
    expect(cells(game).map(cellKey)).not.toEqual(before);
  });
});

describe("hold", () => {
  it("stores, ignores until lock, then swaps", () => {
    const game = createGame({ bag: ["T", "I", "O", "L"] });
    expect(game.getSnapshot().active?.type).toBe("T");
    expect(game.getSnapshot().hold).toBeNull();
    expect(game.getSnapshot().canHold).toBe(true);

    game.dispatch("hold");
    expect(game.getSnapshot().hold).toBe("T");
    expect(game.getSnapshot().active?.type).toBe("I");
    expect(game.getSnapshot().canHold).toBe(false);

    game.dispatch("hold");
    expect(game.getSnapshot().hold).toBe("T");
    expect(game.getSnapshot().active?.type).toBe("I");

    game.dispatch("hard");
    expect(game.getSnapshot().active?.type).toBe("O");
    expect(game.getSnapshot().canHold).toBe(true);

    game.dispatch("hold");
    expect(game.getSnapshot().hold).toBe("O");
    expect(game.getSnapshot().active?.type).toBe("T");
    expect(game.getSnapshot().canHold).toBe(false);
  });
});

describe("7-bag", () => {
  it("seeded bags are permutations of IOTSZJL", () => {
    const rand = createBagRandomizer(undefined, 20260902);
    const bag1 = Array.from({ length: 7 }, () => rand.next());
    const bag2 = Array.from({ length: 7 }, () => rand.next());
    expect(new Set(bag1).size).toBe(7);
    expect([...bag1].sort()).toEqual([...ALL]);
    expect(new Set(bag2).size).toBe(7);
    expect([...bag2].sort()).toEqual([...ALL]);
  });

  it("next queue is always 5 and matches the following spawn", () => {
    const game = createGame({ bag: ["T", "I", "O", "L", "J", "S", "Z"] });
    const snap = game.getSnapshot();
    expect(snap.active?.type).toBe("T");
    expect(snap.next).toHaveLength(5);
    expect(snap.next[0]).toBe("I");
    expect(snap.next.slice(0, 5)).toEqual(["I", "O", "L", "J", "S"]);
    game.dispatch("hard");
    expect(game.getSnapshot().active?.type).toBe("I");
    expect(game.getSnapshot().next[0]).toBe("O");
    expect(game.getSnapshot().next).toHaveLength(5);
  });
});

describe("DAS/ARR", () => {
  it("moves immediately, then after DAS, then on ARR", () => {
    const game = createGame({
      bag: ["T", "I"],
      gravityMs: 1e9,
      dasMs: 133,
      arrMs: 33,
    });
    const x0 = game.getSnapshot().active!.x;
    game.dispatch("leftDown");
    expect(game.getSnapshot().active?.x).toBe(x0 - 1);
    game.dispatch("tick", 132);
    expect(game.getSnapshot().active?.x).toBe(x0 - 1);
    game.dispatch("tick", 1);
    expect(game.getSnapshot().active?.x).toBe(x0 - 2);
    game.dispatch("tick", 33);
    expect(game.getSnapshot().active?.x).toBe(x0 - 3);
  });
});

describe("lock move-reset", () => {
  it("successful shift resets lockElapsed toward 0", () => {
    const game = createGame({
      bag: ["O", "T"],
      gravityMs: 100,
      lockMs: 500,
    });
    while (!game.getSnapshot().locking) {
      game.dispatch("tick", 100);
    }
    expect(game.getSnapshot().locking).toBe(true);
    game.dispatch("tick", 200);
    expect(game.getSnapshot().lockElapsed).toBeGreaterThan(0);
    const elapsed = game.getSnapshot().lockElapsed;
    game.dispatch("left");
    expect(game.getSnapshot().lockElapsed).toBe(0);
    expect(elapsed).toBeGreaterThan(0);
    expect(game.getSnapshot().locking).toBe(true);
    expect(game.getSnapshot().active?.type).toBe("O");
  });
});

describe("spawn peek", () => {
  it("T and I occupy a visible row at spawn", () => {
    const t = createGame({ bag: ["T", "I"] });
    expect(t.getSnapshot().active!.cells.some((c) => c.y >= 2)).toBe(true);
    const i = createGame({ bag: ["I", "T"] });
    expect(i.getSnapshot().active!.cells.some((c) => c.y >= 2)).toBe(true);
  });
});

describe("ghost", () => {
  it("ghost Y is the hard-drop destination without locking", () => {
    const game = createGame({ bag: ["O", "T"] });
    const ghost = game.getSnapshot().ghost;
    expect(ghost.length).toBe(4);
    game.dispatch("hard");
    const grid = game.getSnapshot().grid;
    for (const c of ghost) {
      expect(grid[c.y]![c.x]).toBe("O");
    }
    expect(game.getSnapshot().active?.type).toBe("T");
  });
});

describe("soft drop", () => {
  it("drops one cell immediately on softDown", () => {
    const game = createGame({ bag: ["T", "I"], gravityMs: 1e9, softDropMs: 50 });
    const y0 = game.getSnapshot().active!.y;
    game.dispatch("softDown");
    expect(game.getSnapshot().active?.y).toBe(y0 + 1);
    game.dispatch("tick", 49);
    expect(game.getSnapshot().active?.y).toBe(y0 + 1);
    game.dispatch("tick", 1);
    expect(game.getSnapshot().active?.y).toBe(y0 + 2);
  });
});


function wellHoles36(fromRow: number, toRow: number) {
  const grid = emptyGrid();
  for (let y = fromRow; y <= toRow; y++) {
    for (let x = 0; x < 10; x++) {
      if (x < 3 || x > 6) {
        grid[y]![x] = "Z";
      }
    }
  }
  return grid;
}

describe("level-up", () => {
  it("10 lines -> level 2; 20 lines -> level 3", () => {
    const bag = Array.from({ length: 24 }, () => "I" as const);
    const ten = createGame({
      bag,
      grid: wellHoles36(12, 21),
      gravityMs: 1e9,
    });
    for (let i = 0; i < 10; i++) {
      ten.dispatch("hard");
    }
    expect(ten.getSnapshot().linesClearedTotal).toBe(10);
    expect(ten.getSnapshot().level).toBe(2);

    const twenty = createGame({
      bag,
      grid: wellHoles36(2, 21),
      gravityMs: 1e9,
    });
    for (let i = 0; i < 20; i++) {
      twenty.dispatch("hard");
    }
    expect(twenty.getSnapshot().linesClearedTotal).toBe(20);
    expect(twenty.getSnapshot().level).toBe(3);
  });
});

describe("drops score", () => {
  it("soft drop awards 1 per cell, not times level", () => {
    const game = createGame({ bag: ["T", "I"], gravityMs: 1e9 });
    const y0 = game.getSnapshot().active!.y;
    game.dispatch("softDown");
    expect(game.getSnapshot().active?.y).toBe(y0 + 1);
    expect(game.getSnapshot().score).toBe(1);
  });

  it("hard drop awards 2 per cell traversed, not times level", () => {
    const game = createGame({ bag: ["O", "T"], gravityMs: 1e9 });
    const y0 = game.getSnapshot().active!.y;
    game.dispatch("hard");
    const cells = 20 - y0;
    expect(game.getSnapshot().score).toBe(cells * 2);
    expect(game.getSnapshot().piecesLocked).toBe(1);
  });
});

describe("T-Spin detection", () => {
  it("awards a 3-corner T-Spin after rotate", () => {
    const grid = emptyGrid();
    grid[19]![3] = "I";
    grid[21]![3] = "I";
    grid[21]![5] = "I";
    const game = createGame({
      bag: ["T", "I"],
      grid,
      gravityMs: 1,
      lockMs: 80,
    });
    game.dispatch("cw");
    let guard = 0;
    while (!game.getSnapshot().locking && guard++ < 80) {
      game.dispatch("tick", 1);
    }
    expect(game.getSnapshot().locking).toBe(true);
    expect(game.getSnapshot().active?.y).toBe(19);
    game.dispatch("cw");
    expect(game.getSnapshot().active?.rotation).toBe(2);
    const before = game.getSnapshot().score;
    game.dispatch("tick", 80);
    expect(game.getSnapshot().piecesLocked).toBe(1);
    expect(game.getSnapshot().score - before).toBe(400);
    expect(game.getSnapshot().lastClearCount).toBe(0);
  });

  it("awards Mini when the T-Spin used a wall-kick", () => {
    const grid = emptyGrid();
    grid[21]![4] = "I";
    grid[21]![2] = "I";
    grid[19]![2] = "I";
    const game = createGame({
      bag: ["T", "I"],
      grid,
      gravityMs: 1,
      lockMs: 80,
    });
    let guard = 0;
    while (!game.getSnapshot().locking && guard++ < 80) {
      game.dispatch("tick", 1);
    }
    expect(game.getSnapshot().locking).toBe(true);
    const x0 = game.getSnapshot().active!.x;
    game.dispatch("cw");
    expect(game.getSnapshot().active?.rotation).toBe(1);
    expect(game.getSnapshot().active?.x).not.toBe(x0);
    const before = game.getSnapshot().score;
    game.dispatch("tick", 80);
    expect(game.getSnapshot().score - before).toBe(100);
  });
});

describe("lock-reset cap", () => {
  it("after 15 successful resets a grounded piece locks on the next downward fail", () => {
    const game = createGame({
      bag: ["O", "T"],
      gravityMs: 100,
      lockMs: 5000,
    });
    let guard = 0;
    while (!game.getSnapshot().locking && guard++ < 40) {
      game.dispatch("tick", 100);
    }
    expect(game.getSnapshot().locking).toBe(true);
    expect(game.getSnapshot().active?.type).toBe("O");
    for (let i = 0; i < 15; i++) {
      game.dispatch(i % 2 === 0 ? "left" : "right");
    }
    expect(game.getSnapshot().active?.type).toBe("O");
    expect(game.getSnapshot().locking).toBe(true);
    game.dispatch("softDown");
    expect(game.getSnapshot().active?.type).toBe("T");
    expect(game.getSnapshot().piecesLocked).toBe(1);
  });
});

describe("combo in game", () => {
  it("second consecutive single at level 1 adds 50", () => {
    const grid = emptyGrid();
    grid[19]![0] = "J";
    for (let x = 0; x < 10; x++) {
      if (x < 3 || x > 6) {
        grid[20]![x] = "Z";
        grid[21]![x] = "Z";
      }
    }
    const game = createGame({ bag: ["I", "I", "T"], grid, gravityMs: 1e9 });
    game.dispatch("hard");
    const afterFirst = game.getSnapshot().score;
    game.dispatch("hard");
    const afterSecond = game.getSnapshot().score;
    const secondGain = afterSecond - afterFirst;
    expect(secondGain).toBe(188);
  });
});
