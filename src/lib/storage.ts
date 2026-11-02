export const MOODS = ["happy", "calm", "okay", "tired", "anxious", "sad", "overwhelmed"] as const;
export type Mood = (typeof MOODS)[number];
export const MOOD_EMOJI: Record<Mood, string> = { happy: "🌼", calm: "🍃", okay: "🌤️", tired: "🌙", anxious: "🌊", sad: "🌧️", overwhelmed: "🌪️" };
/** Higher = brighter mood, used for the trend chart. */
export const MOOD_VALUE: Record<Mood, number> = { happy: 7, calm: 6, okay: 5, tired: 4, anxious: 3, sad: 2, overwhelmed: 1 };

export type MoodEntry = { date: string; mood: Mood; energy: number; note: string };
export type EpdsRecord = { date: string; total: number; safety: boolean };

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
export const loadMoods = () => read<MoodEntry>("bloom-moods");
export function saveMood(e: MoodEntry) {
  const list = loadMoods().filter((m) => m.date !== e.date);
  list.push(e);
  list.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem("bloom-moods", JSON.stringify(list));
  return list;
}
export const loadEpds = () => read<EpdsRecord>("bloom-epds");
export function saveEpds(r: EpdsRecord) {
  const list = [...loadEpds(), r];
  localStorage.setItem("bloom-epds", JSON.stringify(list));
  return list;
}
export const todayKey = () => new Date().toISOString().slice(0, 10);
