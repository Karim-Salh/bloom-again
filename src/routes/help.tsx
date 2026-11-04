import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, CheckCircle2, Circle } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Get Help & Emergency Support — Bloom Again" },
      { name: "description", content: "Crisis lines and guidance for preparing to talk to a doctor about postpartum depression." },
      { property: "og:title", content: "Get Help — Bloom Again" },
      { property: "og:description", content: "Emergency and professional support for mothers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Help,
});


function Help() {
  const { t } = useI18n();
  const LINES = useSiteContent().lines;
  const [done, setDone] = useState<number[]>([]);
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="font-display text-3xl md:text-4xl">{t.help.title}</h1>
        <p className="mt-3 rounded-2xl bg-rose/50 p-4 font-semibold">{t.help.sub}</p>
        <h2 className="mt-10 font-display text-xl">{t.help.lines}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {LINES.map((l) => (
            <a key={l.name + l.phone} href={`tel:${l.phone}`} className="flex items-center justify-between rounded-3xl border bg-card p-5 transition hover:shadow-soft">
              <span><span className="block text-xs text-muted-foreground">{l.country}</span><span className="font-semibold">{l.name}</span></span>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 font-semibold" dir="ltr"><Phone className="h-4 w-4" />{l.phone}</span>
            </a>
          ))}
        </div>
        <h2 className="mt-12 font-display text-xl">{t.help.prep}</h2>
        <ul className="mt-4 space-y-2">
          {t.help.prepItems.map((p, i) => {
            const on = done.includes(i);
            return (
              <li key={p}>
                <button onClick={() => setDone(on ? done.filter((d) => d !== i) : [...done, i])} className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-start">
                  {on ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                  <span className={on ? "line-through text-muted-foreground" : ""}>{p}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </SiteShell>
  );
}
