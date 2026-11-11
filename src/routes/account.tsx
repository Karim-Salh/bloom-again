import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { deviceProgress, importDeviceProgress, loadEpdsProgress, loadMoodProgress } from "@/lib/progress";
import type { EpdsRecord, MoodEntry } from "@/lib/storage";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Progress — Bloom Again" },
      { name: "description", content: "Sign in optionally to save and follow your postpartum mood and screening progress." },
      { property: "og:title", content: "My Progress — Bloom Again" },
      { property: "og:description", content: "Keep your private mood and screening progress together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { t, lang } = useI18n();
  const a = t.account;
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [screenings, setScreenings] = useState<EpdsRecord[]>([]);
  const [localCounts, setLocalCounts] = useState({ moods: 0, screenings: 0 });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const local = deviceProgress();
    setLocalCounts({ moods: local.moods.length, screenings: local.screenings.length });
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileName("");
      setMoods([]);
      setScreenings([]);
      return;
    }
    let active = true;
    void Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      loadMoodProgress(),
      loadEpdsProgress(),
    ]).then(([profile, moodData, epdsData]) => {
      if (!active) return;
      if (profile.error) throw profile.error;
      setProfileName(profile.data?.display_name ?? String(user.user_metadata.display_name ?? ""));
      setMoods(moodData);
      setScreenings(epdsData);
    }).catch(() => {
      if (active) toast.error(a.saveError);
    });
    return () => { active = false; };
  }, [a.saveError, user]);

  const latestScreening = useMemo(() => screenings.at(-1), [screenings]);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) setNotice(a.confirmation);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      setPassword("");
    } catch {
      toast.error(a.authError);
    } finally {
      setBusy(false);
    }
  };

  const saveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: profileName.trim(), updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) return toast.error(a.saveError);
    toast.success(a.saved);
  };

  const handleImport = async () => {
    setBusy(true);
    try {
      await importDeviceProgress();
      const [moodData, epdsData] = await Promise.all([loadMoodProgress(), loadEpdsProgress()]);
      setMoods(moodData);
      setScreenings(epdsData);
      setLocalCounts({ moods: 0, screenings: 0 });
      setImported(true);
      toast.success(a.importDone);
    } catch {
      toast.error(a.saveError);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) toast.error(a.authError);
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-7 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary"><Heart className="h-5 w-5" /></span>
            <div>
              <h1 className="font-display text-3xl">{a.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{user ? (user.email ?? "") : a.intro}</p>
            </div>
          </div>

          {user === undefined ? (
            <div className="rounded-2xl border bg-card p-8 text-muted-foreground">…</div>
          ) : user ? (
            <div className="space-y-6">
              <section className="rounded-2xl border bg-card p-6 shadow-soft">
                <h2 className="flex items-center gap-2 font-display text-xl"><UserRound className="h-5 w-5" />{a.profile}</h2>
                <form onSubmit={saveName} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <label className="flex-1 text-sm text-muted-foreground">{a.displayName}
                    <input value={profileName} maxLength={80} onChange={(event) => setProfileName(event.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                  <Button type="submit" disabled={busy} className="sm:mt-6">{a.saveProfile}</Button>
                </form>
                <Button type="button" variant="outline" disabled={busy} onClick={() => void signOut()} className="mt-4"><LogOut />{a.signOut}</Button>
              </section>

              {localCounts.moods + localCounts.screenings > 0 && !imported && (
                <section className="rounded-2xl border border-primary/30 bg-secondary/50 p-6">
                  <h2 className="font-display text-lg">{a.importTitle}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{a.importBody}</p>
                  <Button type="button" onClick={() => void handleImport()} disabled={busy} className="mt-4">{busy ? a.importing : a.importButton}</Button>
                </section>
              )}

              <section className="rounded-2xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl">{a.title}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <ProgressStat label={a.moodEntries} value={moods.length} />
                  <ProgressStat label={a.screenings} value={screenings.length} />
                  <ProgressStat label={a.latestScore} value={latestScreening ? `${latestScreening.total} / 30` : "—"} />
                </div>
                {moods.length === 0 && screenings.length === 0 && <p className="mt-4 text-sm text-muted-foreground">{a.noProgress}</p>}
                <p className="mt-4 text-sm text-muted-foreground">{a.moodEntries}: {moods.slice(-7).reverse().map((entry) => `${new Date(`${entry.date}T12:00:00`).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")} · ${t.moods[entry.mood]}`).join("  ·  ")}</p>}
                {screenings.length > 0 && <p className="mt-2 text-sm text-muted-foreground">{a.screenings}: {screenings.slice(-5).reverse().map((entry) => `${new Date(entry.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")} · ${entry.total}${entry.safety ? " ⚠" : ""}`).join("  ·  ")}</p>}
              </section>
            </div>
          ) : (
            <section className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
              <div className="mb-5 flex gap-2 border-b pb-4">
                <Button type="button" variant={mode === "signin" ? "default" : "ghost"} onClick={() => setMode("signin")}>{a.signIn}</Button>
                <Button type="button" variant={mode === "signup" ? "default" : "ghost"} onClick={() => setMode("signup")}>{a.signUp}</Button>
              </div>
              <form onSubmit={submitAuth} className="space-y-4">
                {mode === "signup" && <label className="block text-sm text-muted-foreground">{a.displayName}
                  <input autoComplete="name" value={displayName} maxLength={80} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </label>}
                <label className="block text-sm text-muted-foreground">{a.email}
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </label>
                <label className="block text-sm text-muted-foreground">{a.password}
                  <input required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </label>
                <Button type="submit" disabled={busy} className="w-full">{busy ? "…" : mode === "signup" ? a.submitSignUp : a.submitSignIn}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Button>
              </form>
              <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setNotice(""); }} className="mt-4 text-sm text-primary underline-offset-4 hover:underline">
                {mode === "signin" ? a.switchToSignUp : a.switchToSignIn}
              </button>
              {notice && <p role="status" className="mt-4 rounded-lg bg-secondary p-3 text-sm">{notice}</p>}
              <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">{a.signedOutNote}</p>
              {(localCounts.moods + localCounts.screenings > 0) && <p className="mt-3 text-sm text-muted-foreground">{a.importTitle}: {localCounts.moods} · {a.moodEntries}, {localCounts.screenings} · {a.screenings}</p>}
              <Link to="/" className="mt-5 inline-flex items-center gap-2 text-sm text-primary"><ArrowRight className="h-4 w-4 rtl:rotate-180" />{t.nav.home}</Link>
            </section>
          )}
        </motion.div>
      </div>
    </SiteShell>
  );
}

function ProgressStat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-muted/60 p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl">{value}</p></div>;
}