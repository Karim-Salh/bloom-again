import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  loadEpds,
  loadMoods,
  saveEpds,
  saveMood,
  type EpdsRecord,
  type MoodEntry,
} from "@/lib/storage";

export type MoodRow = {
  user_id: string;
  entry_date: string;
  mood: MoodEntry["mood"];
  energy: number;
  note: string;
};

export type EpdsRow = {
  user_id: string;
  recorded_at: string;
  total: number;
  safety: boolean;
};

export const moodRowForUser = (userId: string, entry: MoodEntry): MoodRow => ({
  user_id: userId,
  entry_date: entry.date,
  mood: entry.mood,
  energy: entry.energy,
  note: entry.note,
});

export const epdsRowForUser = (userId: string, entry: EpdsRecord): EpdsRow => ({
  user_id: userId,
  recorded_at: entry.date,
  total: entry.total,
  safety: entry.safety,
});

export async function currentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function loadMoodProgress(): Promise<MoodEntry[]> {
  const user = await currentUser();
  if (!user) return loadMoods();
  const { data, error } = await supabase
    .from("mood_entries")
    .select("entry_date, mood, energy, note")
    .order("entry_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    date: row.entry_date,
    mood: row.mood as MoodEntry["mood"],
    energy: row.energy,
    note: row.note,
  }));
}

export async function saveMoodProgress(entry: MoodEntry): Promise<MoodEntry[]> {
  const user = await currentUser();
  if (!user) return saveMood(entry);
  const { error } = await supabase.from("mood_entries").upsert(moodRowForUser(user.id, entry), {
    onConflict: "user_id,entry_date",
  });
  if (error) throw error;
  return loadMoodProgress();
}

export async function loadEpdsProgress(): Promise<EpdsRecord[]> {
  const user = await currentUser();
  if (!user) return loadEpds();
  const { data, error } = await supabase
    .from("epds_records")
    .select("recorded_at, total, safety")
    .order("recorded_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({ date: row.recorded_at, total: row.total, safety: row.safety }));
}

export async function saveEpdsProgress(entry: EpdsRecord): Promise<EpdsRecord[]> {
  const user = await currentUser();
  if (!user) return saveEpds(entry);
  const { error } = await supabase.from("epds_records").upsert(epdsRowForUser(user.id, entry), {
    onConflict: "user_id,recorded_at",
  });
  if (error) throw error;
  return loadEpdsProgress();
}

export function deviceProgress() {
  return { moods: loadMoods(), screenings: loadEpds() };
}

export async function importDeviceProgress(): Promise<{ moods: number; screenings: number }> {
  const user = await currentUser();
  if (!user) throw new Error("Sign in before importing device progress.");

  const local = deviceProgress();
  if (local.moods.length > 0) {
    const { error } = await supabase.from("mood_entries").upsert(
      local.moods.map((entry) => moodRowForUser(user.id, entry)),
      { onConflict: "user_id,entry_date" },
    );
    if (error) throw error;
  }
  if (local.screenings.length > 0) {
    const { error } = await supabase.from("epds_records").upsert(
      local.screenings.map((entry) => epdsRowForUser(user.id, entry)),
      { onConflict: "user_id,recorded_at" },
    );
    if (error) throw error;
  }

  localStorage.removeItem("bloom-moods");
  localStorage.removeItem("bloom-epds");
  return { moods: local.moods.length, screenings: local.screenings.length };
}