import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, HeartHandshake, NotebookPen, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { useSiteContent } from "@/lib/site-content";
import { MOODS, MOOD_EMOJI, type Mood } from "@/lib/storage";
import heroImg from "@/assets/hero-mother.jpg";

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

const ease = [0.22, 1, 0.36, 1] as const;

function Petal({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.svg viewBox="0 0 100 100" className={className} aria-hidden
      animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, delay, ease: "easeInOut" }}>
      <path d="M50 5 C80 25 85 70 50 95 C15 70 20 25 50 5Z" fill="currentColor" />
    </motion.svg>
  );
}

function Index() {
  const { t, lang } = useI18n();
  const c = useSiteContent();
  const [mood, setMood] = useState<Mood | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const icons = [ShieldCheck, NotebookPen, HeartHandshake];
  const words = c.heroTitle[lang].split(" ");
  const quotes = c.quotes[lang];

  return (
    <SiteShell>
      <section ref={heroRef} className="relative overflow-hidden bg-hero">
        <Petal className="absolute -top-6 start-10 h-28 w-28 text-sage/50" />
        <Petal className="absolute top-1/2 end-4 h-16 w-16 text-rose/60" delay={1.5} />
        <Petal className="absolute bottom-10 start-1/3 h-14 w-14 text-lavender" delay={3} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sage-deep" />{t.tagline}
            </motion.p>
            <h1 className="font-display text-4xl leading-[1.1] md:text-6xl">
              {words.map((w, i) => (
                <motion.span key={`${lang}-${i}`} className={`me-[0.25em] inline-block ${i >= words.length - 2 ? "text-gradient" : ""}`}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.7, ease }}>{w}</motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-6 max-w-lg text-lg text-muted-foreground">{c.heroSub[lang]}</motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, ease }} className="mt-8 flex flex-wrap gap-3">
              <Link to="/screening" className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5">
                {t.ctaScreen}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link to="/mood" className="rounded-full border bg-card px-6 py-3.5 font-semibold transition hover:bg-secondary">{t.ctaMood}</Link>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.92, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.2, duration: 1, ease }} className="relative">
            <div className="overflow-hidden rounded-[2.5rem] shadow-soft">
              <motion.img style={{ y: imgY }} src={heroImg} alt="A mother tenderly holding her newborn among blooming flowers" width={1200} height={1408} className="h-[460px] w-full scale-110 object-cover md:h-[560px]" />
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, ease }}
              className="absolute z-10 -bottom-8 start-[-1rem] w-[88%] rounded-3xl border bg-card/90 p-5 shadow-soft backdrop-blur-xl md:start-[-3rem]">
              <p className="font-display">{t.teaser}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <motion.button key={m} whileHover={{ scale: 1.15, y: -3 }} whileTap={{ scale: 0.9 }} onClick={() => setMood(m)} title={t.moods[m]}
                    className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition ${mood === m ? "bg-secondary ring-2 ring-ring" : "hover:bg-muted"}`}>{MOOD_EMOJI[m]}</motion.button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {mood && <motion.p key={mood} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }} className="mt-3 text-sm text-muted-foreground"><b className="text-foreground">{t.moods[mood]}</b> — {t.teaserReply[mood]}</motion.p>}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="overflow-hidden border-y bg-card py-5 mt-12" dir="ltr">
        <div className="flex w-max animate-marquee gap-10">
          {[...quotes, ...quotes, ...quotes, ...quotes].map((q, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-lg text-muted-foreground">“{q}”<span className="text-rose">✿</span></span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {t.features.map(([title, body], i) => {
            const Icon = icons[i]!;
            return (
              <motion.div key={title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.12, duration: 0.7, ease }} whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-3xl border bg-card p-8 transition-shadow hover:shadow-soft">
                <div className={`absolute -end-10 -top-10 h-32 w-32 rounded-full opacity-60 blur-2xl transition group-hover:scale-150 ${["bg-sage", "bg-rose", "bg-lavender"][i]}`} />
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Icon className="h-7 w-7 text-primary" /></span>
                <h3 className="relative mt-6 font-display text-xl">{title}</h3>
                <p className="relative mt-2 text-muted-foreground">{body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-brand p-10 text-center text-primary-foreground md:p-16">
          <Petal className="absolute -start-6 -top-6 h-32 w-32 text-card/15" />
          <Petal className="absolute -bottom-8 end-10 h-24 w-24 text-card/15" delay={2} />
          <h2 className="relative font-display text-3xl md:text-4xl">{quotes[1]}</h2>
          <Link to="/screening" className="relative mt-8 inline-flex rounded-full bg-card px-7 py-3.5 font-semibold text-foreground transition hover:-translate-y-0.5">{t.ctaScreen}</Link>
        </motion.div>
      </section>
    </SiteShell>
  );
}
