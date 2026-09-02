import { describe, expect, it } from "vitest";
import {
  HIGHSCORE_LIMIT,
  qualifiesForHighscore,
  sanitizeName,
  sortAndTrim,
  type HighscoreEntry,
} from "../src/ui/highscore";

function entry(score: number, name = "AAA"): HighscoreEntry {
  return {
    name,
    date: "2026-01-01T00:00:00.000Z",
    score,
    level: 2,
    lines: 12,
  };
}

describe("qualifiesForHighscore", () => {
  it("rejects score 0 even when the list is empty", () => {
    expect(qualifiesForHighscore(0, [])).toBe(false);
  });

  it("accepts a positive score when the list is empty", () => {
    expect(qualifiesForHighscore(100, [])).toBe(true);
  });

  it("rejects a score below the lowest of a full top 10", () => {
    const tenFilled = Array.from({ length: 10 }, (_, i) => entry(100 + i * 10));
    const sorted = sortAndTrim(tenFilled);
    const lowest = sorted[sorted.length - 1]!.score;
    expect(lowest).toBeGreaterThan(50);
    expect(qualifiesForHighscore(50, tenFilled)).toBe(false);
  });
});

describe("sanitizeName", () => {
  it("uppercases, strips junk, and pads to 3 characters", () => {
    expect(sanitizeName("neo")).toBe("NEO");
    expect(sanitizeName("ab")).toBe("ABA");
    expect(sanitizeName("hi!")).toBe("HIA");
    expect(sanitizeName("")).toBe("AAA");
    expect(sanitizeName("r2-d2")).toBe("R2D");
  });
});

describe("sortAndTrim", () => {
  it("keeps 10 highest scores", () => {
    const many = Array.from({ length: 12 }, (_, i) => entry(i * 10, "A" + i));
    const trimmed = sortAndTrim(many);
    expect(trimmed).toHaveLength(HIGHSCORE_LIMIT);
    expect(trimmed[0]!.score).toBe(110);
    expect(trimmed[trimmed.length - 1]!.score).toBe(20);
  });
});
