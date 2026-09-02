export const HIGHSCORE_KEY = "tetris-apex-highscores";
export const HIGHSCORE_LIMIT = 10;

export interface HighscoreEntry {
  name: string;
  date: string;
  score: number;
  level: number;
  lines: number;
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function sanitizeName(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  return (cleaned + "AAA").slice(0, 3);
}

export function loadHighscores(): HighscoreEntry[] {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(HIGHSCORE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries: HighscoreEntry[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      if (typeof rec.score !== "number" || typeof rec.level !== "number" || typeof rec.lines !== "number") {
        continue;
      }
      entries.push({
        name: sanitizeName(typeof rec.name === "string" ? rec.name : "AAA"),
        date: typeof rec.date === "string" ? rec.date : new Date().toISOString(),
        score: rec.score,
        level: rec.level,
        lines: rec.lines,
      });
    }
    return sortAndTrim(entries);
  } catch {
    return [];
  }
}

export function sortAndTrim(entries: HighscoreEntry[]): HighscoreEntry[] {
  return entries
    .slice()
    .sort((a, b) => b.score - a.score || b.lines - a.lines)
    .slice(0, HIGHSCORE_LIMIT);
}

export function qualifiesForHighscore(score: number, list: HighscoreEntry[] = loadHighscores()): boolean {
  if (list.length < HIGHSCORE_LIMIT) return true;
  const lowest = list[list.length - 1];
  return lowest !== undefined && score >= lowest.score;
}

export function addHighscore(entry: Omit<HighscoreEntry, "date"> & { date?: string }): HighscoreEntry[] {
  const next: HighscoreEntry = {
    name: sanitizeName(entry.name),
    date: entry.date ?? new Date().toISOString(),
    score: entry.score,
    level: entry.level,
    lines: entry.lines,
  };
  const list = sortAndTrim([...loadHighscores(), next]);
  const store = storage();
  if (store) {
    store.setItem(HIGHSCORE_KEY, JSON.stringify(list));
  }
  return list;
}
