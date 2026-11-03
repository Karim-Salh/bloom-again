import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Flower2, Languages, Menu, Phone, X, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useSiteContent } from "@/lib/site-content";

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, toggle, lang } = useI18n();
  const c = useSiteContent();
  const [open, setOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const links = [
    { to: "/", label: t.nav.home },
    { to: "/screening", label: t.nav.screening },
    { to: "/mood", label: t.nav.mood },
    { to: "/help", label: t.nav.help },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatePresence>
        {c.banner.enabled && bannerOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-banner text-primary-foreground">
            <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-10 py-2.5 text-sm relative">
              <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
              <span>{c.banner.text[lang]}</span>
              {c.banner.link && (
                <a href={c.banner.link} className="rounded-full bg-card/20 px-3 py-0.5 font-semibold transition hover:bg-card/30">{c.banner.linkLabel[lang]}</a>
              )}
              <button onClick={() => setBannerOpen(false)} aria-label="Close" className="absolute end-3 opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
        <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-sage-deep" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <Link to="/" className="group flex items-center gap-2 text-lg font-display">
            <motion.span whileHover={{ rotate: 25 }} className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft"><Flower2 className="h-5 w-5" /></motion.span>
            Bloom Again
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {links.map((l) => (
              <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
                className="rounded-full px-3.5 py-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-semibold" }}>{l.label}</Link>
            ))}
            <Link to="/help" className="ms-1 inline-flex items-center gap-1.5 rounded-full bg-rose/60 px-3.5 py-2 font-semibold"><Phone className="h-3.5 w-3.5" />{t.emergencyCta}</Link>
            <button onClick={toggle} className="ms-1 inline-flex items-center gap-1 rounded-full border px-3 py-2 hover:bg-muted" aria-label="Switch language">
              <Languages className="h-4 w-4" /> {t.lang}
            </button>
          </nav>
          <button className="md:hidden rounded-full border p-2" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t md:hidden">
              <div className="flex flex-col gap-1 p-4">
                {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 hover:bg-muted">{l.label}</Link>)}
                <button onClick={toggle} className="rounded-xl px-3 py-2 text-start hover:bg-muted">{t.lang}</button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <motion.main key={lang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="flex-1">{children}</motion.main>
      <footer className="border-t bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-muted-foreground md:grid-cols-[1fr_2fr]">
          <div>
            <p className="flex items-center gap-2 font-display text-base text-foreground"><Flower2 className="h-4 w-4 text-primary" /> Bloom Again</p>
            <p className="mt-1">{t.tagline}</p>
            <p className="mt-3 text-xs">© {new Date().getFullYear()} Bloom Again</p>
          </div>
          <p className="rounded-2xl bg-lavender/50 p-4">⚕️ {t.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
