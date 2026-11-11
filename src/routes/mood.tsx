import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Activity, BatteryLow, CloudAlert, Frown, Leaf, Meh, Smile, type LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { todayKey, MOODS, MOOD_VALUE, type Mood, type MoodEntry } from "@/lib/storage";
import { loadMoodProgress, saveMoodProgress } from "@/lib/progress";
import { toast } from "sonner";

const moodIcons: Record<Mood, LucideIcon> = {
  happy: Smile,
  calm: Leaf,
  okay: Meh,
  tired: BatteryLow,
  anxious: Activity,
  sad: Frown,
  overwhelmed: CloudAlert,
};

export const Route = createFileRoute("/mood")({
  head: () => ({
    meta: [
      { title: "Mood Tracker — Bloom Again" },
      { name: "description", content: "Log your daily postpartum mood, energy and notes, and see your trends over time." },
      { property: "og:title", content: "Mood Tracker — Bloom Again" },
      { property: "og:description", content: "Track how you feel, gently, day by day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MoodPage,
});

function MoodPage() {
  const { t, lang } = useI18n();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void loadMoodProgress().then((list) => {
      if (!active) return;
      setEntries(list);
      const today = list.find((e) => e.date === todayKey());
      if (today) { setMood(today.mood); setEnergy(today.energy); setNote(today.note); }
    }).catch(() => toast.error(t.mood.loadError));
    return () => { active = false; };
  }, [t.mood.loadError]);

  const saveEntry = async () => {
    if (!mood) return;
    try {
      setEntries(await saveMoodProgress({ date: todayKey(), mood, energy, note: note.trim() }));
      setSaved(true);
    } catch {
      toast.error(t.mood.saveError);
    }
  };

  const byDate = useMemo(() => Object.fromEntries(entries.map((e) => [e.date, e])), [entries]);
  const trend = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 13 + i);
    const k = d.toISOString().slice(0, 10);
    return { day: d.getDate(), mood: byDate[k] ? MOOD_VALUE[byDate[k].mood as Mood] : null };
  }), [byDate]);

  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-4xl bg-card p-7 shadow-soft">
          <h1 className="font-display text-3xl">{t.mood.title}</h1>
          <p className="mt-6 font-semibold">{t.mood.pick}</p>
          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-7">
            {MOODS.map((m) => (
              <motion.button key={m} whileHover={{ y: -4 }} whileTap={{ scale: 0.9 }} onClick={() => { setMood(m); setSaved(false); }}
                aria-pressed={mood === m} aria-label={t.moods[m]}
                className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl p-2 text-xs ${mood === m ? "bg-secondary ring-2 ring-ring" : "hover:bg-muted"}`}>
                {(() => { const Icon = moodIcons[m]; return <Icon className="h-6 w-6" aria-hidden="true" />; })()}
                <span>{t.moods[m]}</span>
              </motion.button>
            ))}
          </div>
          <label className="mt-6 block font-semibold">{t.mood.energy}: {energy}/5
            <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(+e.target.value)} className="mt-2 w-full accent-primary" />
          </label>
          <label className="mt-4 block font-semibold">{t.mood.note}
            <textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} rows={3}
              className="mt-2 w-full rounded-2xl border bg-background p-3 font-normal outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <button disabled={!mood} onClick={() => void saveEntry()}
            className="mt-4 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40">{t.mood.save}</button>
          {saved && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-primary">{t.mood.saved}</motion.p>}
        </div>

        <div className="space-y-8">
          <div className="rounded-4xl bg-card p-7">
            <h2 className="font-display text-xl">{t.mood.trend}</h2>
            {entries.length === 0 ? <p className="mt-4 text-muted-foreground">{t.mood.empty}</p> : (
              <div className="mt-4 h-48" dir="ltr">
                <ResponsiveContainer>
                  <AreaChart data={trend}>
                    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--sage-deep)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--sage-deep)" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis domain={[1, 7]} hide />
                    <Tooltip formatter={(v: number) => { const m = MOODS.find((k) => MOOD_VALUE[k] === v); return m ? t.moods[m] : v; }} />
                    <Area type="monotone" dataKey="mood" stroke="var(--sage-deep)" strokeWidth={3} fill="url(#g)" connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="rounded-4xl bg-card p-7">
            <h2 className="font-display text-xl">{t.mood.calendar} · {now.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { month: "long" })}</h2>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {Array.from({ length: first.getDay() }).map((_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: days }, (_, i) => {
                const k = new Date(Date.UTC(now.getFullYear(), now.getMonth(), i + 1)).toISOString().slice(0, 10);
                const e = byDate[k];
                const Icon = e ? moodIcons[e.mood] : null;
                return (
                  <div key={k} title={e ? `${t.moods[e.mood as Mood]}${e.note ? " — " + e.note : ""}` : ""}
                    className={`grid aspect-square place-items-center rounded-xl text-xs ${e ? "bg-secondary" : "bg-muted text-muted-foreground"}`}>
                    {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
