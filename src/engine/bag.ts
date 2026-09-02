import { PIECE_TYPES } from "./pieces";
import type { PieceType } from "./types";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

export function createBagRandomizer(
  injected?: PieceType[],
  seed?: number,
): { next(): PieceType; peek(n: number): PieceType[]; reset(): void } {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  const injectedCopy = injected ? injected.slice() : [];
  let queue: PieceType[] = [];

  function refill(): void {
    queue.push(...shuffle(PIECE_TYPES.slice() as PieceType[], rng));
  }

  function ensure(n: number): void {
    while (queue.length < n) {
      refill();
    }
  }

  function reset(): void {
    queue = injectedCopy.slice();
  }

  function peek(n: number): PieceType[] {
    ensure(n);
    return queue.slice(0, n);
  }

  function next(): PieceType {
    ensure(1);
    return queue.shift()!;
  }

  reset();
  return { next, peek, reset };
}
