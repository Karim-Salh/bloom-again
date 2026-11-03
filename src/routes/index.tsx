import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HeartHandshake, NotebookPen, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { MOODS, MOOD_EMOJI, type Mood } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bloom Again — Postpartum Mental Health Support" },
      { name: "description", content: "Gentle EPDS screening, mood tracking and support for new mothers, in English and Arabic." },
      { property: "og:title", content: "Bloom Again — Postpartum Mental Health Support" },
      { property: "og:description", content: "Because every mother deserves to feel supported." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Petal({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 100 100" className={className} aria-hidden
      animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }} transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}>
      <path d="M50 5 C80 25 85 70 50 95 C15 70 20 25 50 5Z" fill="currentColor" />
    </motion.svg>
  );
}

function Index() {
  const { t } = useI18n();
  const [mood, setMood] = useState<Mood | null>(null);
  const icons = [ShieldCheck, NotebookPen, HeartHandshake];
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-hero">
        <Petal className="absolute -top-6 start-10 h-28 w-28 text-sage/50" />
        <Petal className="absolute top-24 end-12 h-20 w-20 text-rose/60" delay={1.5} />
        <Petal className="absolute bottom-6 start-1/3 h-16 w-16 text-lavender" delay={3} />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-4 inline-block rounded-full bg-card/70 px-4 py-1 text-sm text-muted-foreground">{t.tagline}</p>
            <h1 className="font-display text-4xl leading-tight md:text-6xl">{t.heroTitle}</h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">{t.heroSub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/screening" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5">{t.ctaScreen}</Link>
              <Link to="/mood" className="rounded-full border bg-card px-6 py-3 font-semibold transition hover:bg-secondary">{t.ctaMood}</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="self-center rounded-4xl bg-card/85 p-7 shadow-soft backdrop-blur">
            <h2 className="font-display text-xl">{t.teaser}</h2>
            <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-7 md:grid-cols-4">
              {MOODS.map((m) => (
                <motion.button key={m} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setMood(m)}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-xs transition ${mood === m ? "bg-secondary ring-2 ring-ring" : "hover:bg-muted"}`}>
                  <span className="text-2xl">{MOOD_EMOJI[m]}</span>{t.moods[m]}
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {mood && (
                <motion.p key={mood} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-5 rounded-2xl bg-peach/60 p-4">{t.teaserReply[mood]}</motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-20 md:grid-cols-3">
        {t.features.map(([title, body], i) => {
          const Icon = icons[i]!;
          return (
            <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="rounded-3xl border bg-card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary"><Icon className="h-6 w-6 text-primary" /></span>
              <h3 className="mt-5 font-display text-lg">{title}</h3>
              <p className="mt-2 text-muted-foreground">{body}</p>
            </motion.div>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.encouragement.map((e, i) => (
            <motion.blockquote key={e} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className={`rounded-3xl p-6 font-display ${["bg-sage/40", "bg-rose/40", "bg-lavender/70", "bg-peach/70"][i]}`}>
              “{e}”
            </motion.blockquote>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
