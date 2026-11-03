import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { EPDS_ITEMS, scoreEpds } from "@/lib/epds";
import { loadEpds, saveEpds, type EpdsRecord } from "@/lib/storage";

export const Route = createFileRoute("/screening")({
  head: () => ({
    meta: [
      { title: "EPDS Postnatal Depression Screening — Bloom Again" },
      { name: "description", content: "Take the validated 10-question Edinburgh Postnatal Depression Scale privately, in English or Arabic." },
      { property: "og:title", content: "EPDS Screening — Bloom Again" },
      { property: "og:description", content: "A gentle, private postnatal depression check-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Screening,
});

function Screening() {
  const { t, lang } = useI18n();
  const s = t.screening;
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [history, setHistory] = useState<EpdsRecord[]>([]);
  const done = step === EPDS_ITEMS.length;
  const result = done ? scoreEpds(answers) : null;

  useEffect(() => setHistory(loadEpds()), []);

  const choose = (opt: number) => {
    const next = [...answers]; next[step] = opt; setAnswers(next);
  };
  const advance = () => {
    if (step === EPDS_ITEMS.length - 1) {
      const r = scoreEpds(answers);
      setHistory(saveEpds({ date: new Date().toISOString(), total: r.total, safety: r.safety }));
    }
    setStep(step + 1);
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="font-display text-3xl md:text-4xl">{s.title}</h1>
        <p className="mt-2 text-muted-foreground">{s.note}</p>

        <div className="mt-8 rounded-4xl bg-card p-7 shadow-soft md:p-10">
          <AnimatePresence mode="wait">
            {step === -1 && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-lg">{s.intro}</p>
                <button onClick={() => setStep(0)} className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{s.start}</button>
              </motion.div>
            )}
            {step >= 0 && !done && (
              <motion.div key={step} initial={{ opacity: 0, x: lang === "ar" ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: lang === "ar" ? 30 : -30 }}>
                <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>{s.question} {step + 1} {s.of} {EPDS_ITEMS.length}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div className="h-full bg-sage-deep" animate={{ width: `${((step + 1) / EPDS_ITEMS.length) * 100}%` }} />
                </div>
                <h2 className="mt-6 font-display text-xl md:text-2xl">{EPDS_ITEMS[step]!.q[lang]}</h2>
                <div className="mt-6 space-y-3" role="radiogroup">
                  {EPDS_ITEMS[step]!.options[lang].map((o, i) => (
                    <button key={o} role="radio" aria-checked={answers[step] === i} onClick={() => choose(i)}
                      className={`w-full rounded-2xl border p-4 text-start transition ${answers[step] === i ? "border-ring bg-secondary font-semibold" : "hover:bg-muted"}`}>
                      {o}
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(step - 1)} className="rounded-full px-5 py-2 text-muted-foreground hover:bg-muted">{s.back}</button>
                  <button disabled={answers[step] === undefined} onClick={advance}
                    className="rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground disabled:opacity-40">
                    {step === EPDS_ITEMS.length - 1 ? s.see : s.next}
                  </button>
                </div>
              </motion.div>
            )}
            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {result.safety && (
                  <div role="alert" className="mb-6 rounded-3xl border-2 border-destructive bg-rose/40 p-5">
                    <p className="flex items-center gap-2 font-display text-lg"><AlertTriangle className="h-5 w-5 text-destructive" />{s.safetyTitle}</p>
                    <p className="mt-2">{s.safetyBody}</p>
                    <Link to="/help" className="mt-4 inline-block rounded-full bg-destructive px-5 py-2 font-semibold text-destructive-foreground">{t.emergencyCta}</Link>
                  </div>
                )}
                <p className="text-muted-foreground">{s.result}</p>
                <p className="font-display text-6xl">{result.total}<span className="text-2xl text-muted-foreground"> / 30</span></p>
                <p className="mt-4 text-lg">{s[result.level]}</p>
                <button onClick={() => { setAnswers([]); setStep(-1); }} className="mt-6 rounded-full border px-5 py-2 hover:bg-muted">{s.retake}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {history.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display text-lg">{s.history}</h3>
            <ul className="mt-3 space-y-2">
              {history.slice(-5).reverse().map((h) => (
                <li key={h.date} className="flex justify-between rounded-2xl bg-card px-4 py-3">
                  <span>{new Date(h.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")}</span>
                  <span className="font-semibold">{h.total}{h.safety ? " ⚠️" : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
