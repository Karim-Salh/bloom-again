import { Link } from "@tanstack/react-router";
import { Flower2, Languages, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, toggle } = useI18n();
  const links = [
    { to: "/", label: t.nav.home },
    { to: "/screening", label: t.nav.screening },
    { to: "/mood", label: t.nav.mood },
    { to: "/help", label: t.nav.help },
  ] as const;
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-rose/60 px-4 py-2 text-center text-sm">
        <span>{t.emergency} </span>
        <Link to="/help" className="inline-flex items-center gap-1 font-semibold underline underline-offset-4">
          <Phone className="h-3.5 w-3.5" /> {t.emergencyCta}
        </Link>
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-display">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sage text-primary-foreground"><Flower2 className="h-5 w-5" /></span>
            Bloom Again
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {links.map((l) => (
              <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
                className="rounded-full px-3 py-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-semibold" }}>
                {l.label}
              </Link>
            ))}
            <button onClick={toggle} className="ms-2 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 hover:bg-muted" aria-label="Switch language">
              <Languages className="h-4 w-4" /> {t.lang}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl space-y-2 px-5 py-8 text-sm text-muted-foreground">
          <p className="font-display text-foreground">Bloom Again — {t.tagline}</p>
          <p className="rounded-2xl bg-lavender/50 p-3">⚕️ {t.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
