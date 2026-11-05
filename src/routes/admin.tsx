import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Flower2, LogOut, Megaphone, Phone, Plus, Quote, Save, Sparkles, Trash2, ExternalLink } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTENT, mergeContent, siteContentQuery, type SiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Bloom Again" },
      { name: "description", content: "Manage Bloom Again site content." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Bloom Again" },
      { property: "og:description", content: "Bloom Again content management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready) return <div className="grid min-h-screen place-items-center text-muted-foreground">…</div>;
  if (!session) return <AuthForm />;
  if (isAdmin === null) return <div className="grid min-h-screen place-items-center text-muted-foreground">…</div>;
  if (!isAdmin) return (
    <div className="grid min-h-screen place-items-center px-5 text-center" dir="rtl">
      <div><p className="font-display text-2xl">ليس لديك صلاحية المدير</p><p className="mt-2 text-muted-foreground">{session.user.email}</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-full border px-5 py-2">تسجيل الخروج</button></div>
    </div>
  );
  return <Editor email={session.user.email ?? ""} />;
}

function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const u = username.trim().toLowerCase();
    const email = u.includes("@") ? u : `${u}@gmail.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
  };
  return (
    <div className="grid min-h-screen place-items-center bg-hero px-5" dir="rtl">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-4xl bg-card p-8 shadow-soft">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground"><Flower2 /></span>
        <h1 className="mt-5 font-display text-2xl">لوحة تحكم Bloom Again</h1>
        <p className="mt-1 text-sm text-muted-foreground">سجّلي الدخول لإدارة الموقع</p>
        <input required autoComplete="username" placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-6 w-full rounded-2xl border bg-background p-3 outline-none focus:ring-2 focus:ring-ring" dir="ltr" />
        <input type="password" required autoComplete="current-password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-3 w-full rounded-2xl border bg-background p-3 outline-none focus:ring-2 focus:ring-ring" dir="ltr" />
        <button disabled={busy} className="mt-5 w-full rounded-full bg-gradient-brand py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "…" : "دخول"}</button>
      </motion.form>
    </div>
  );
}

const input = "w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring";

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg"><span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">{icon}</span>{title}</h2>
      {children}
    </motion.section>
  );
}

function Pair({ label, value, onChange, area }: { label: string; value: { en: string; ar: string }; onChange: (v: { en: string; ar: string }) => void; area?: boolean }) {
  const Tag = area ? "textarea" : "input";
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-sm text-muted-foreground">{label} (English)
        <Tag dir="ltr" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={`mt-1 ${input}`} rows={3} /></label>
      <label className="text-sm text-muted-foreground">{label} (عربي)
        <Tag dir="rtl" value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} className={`mt-1 ${input}`} rows={3} /></label>
    </div>
  );
}

function Editor({ email }: { email: string }) {
  const qc = useQueryClient();
  const [c, setC] = useState<SiteContent>(DEFAULT_CONTENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("content").eq("id", "main").maybeSingle()
      .then(({ data }) => setC(mergeContent(data?.content as Partial<SiteContent>)));
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ id: "main", content: c as never, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    toast.success("تم حفظ التغييرات ونشرها على الموقع ✿");
    return undefined;
  };

  return (
    <div className="min-h-screen bg-muted/40" dir="rtl">
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2 font-display"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground"><Flower2 className="h-4 w-4" /></span>لوحة التحكم</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{email}</span>
            <Link to="/" target="_blank" className="inline-flex items-center gap-1 rounded-full border px-3 py-2 hover:bg-muted"><ExternalLink className="h-4 w-4" />عرض الموقع</Link>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "جارٍ الحفظ…" : "حفظ ونشر"}</button>
            <button onClick={() => supabase.auth.signOut()} className="rounded-full border p-2 hover:bg-muted" aria-label="تسجيل الخروج"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <Section icon={<Megaphone className="h-4 w-4" />} title="البانر الإعلاني أعلى الموقع">
          <label className="mb-4 flex items-center gap-3">
            <input type="checkbox" checked={c.banner.enabled} onChange={(e) => setC({ ...c, banner: { ...c.banner, enabled: e.target.checked } })} className="h-5 w-5 accent-primary" />
            إظهار البانر
          </label>
          <div className="space-y-4">
            <Pair label="نص البانر" value={c.banner.text} onChange={(v) => setC({ ...c, banner: { ...c.banner, text: v } })} />
            <Pair label="نص الزر" value={c.banner.linkLabel} onChange={(v) => setC({ ...c, banner: { ...c.banner, linkLabel: v } })} />
            <label className="block text-sm text-muted-foreground">رابط الزر (مثال: /screening)
              <input dir="ltr" value={c.banner.link} onChange={(e) => setC({ ...c, banner: { ...c.banner, link: e.target.value } })} className={`mt-1 ${input}`} /></label>
            <div className="overflow-hidden rounded-xl bg-banner px-4 py-2.5 text-center text-sm text-primary-foreground">معاينة: {c.banner.text.ar}</div>
          </div>
        </Section>

        <Section icon={<Sparkles className="h-4 w-4" />} title="الواجهة الرئيسية">
          <div className="space-y-4">
            <Pair label="العنوان الرئيسي" value={c.heroTitle} onChange={(v) => setC({ ...c, heroTitle: v })} />
            <Pair label="الوصف" value={c.heroSub} onChange={(v) => setC({ ...c, heroSub: v })} area />
          </div>
        </Section>

        <Section icon={<Quote className="h-4 w-4" />} title="عبارات التشجيع (الشريط المتحرك)">
          <div className="grid gap-4 md:grid-cols-2">
            {(["en", "ar"] as const).map((l) => (
              <div key={l} className="space-y-2">
                <p className="text-sm text-muted-foreground">{l === "en" ? "English" : "عربي"}</p>
                {c.quotes[l].map((q, i) => (
                  <div key={i} className="flex gap-2">
                    <input dir={l === "en" ? "ltr" : "rtl"} value={q} onChange={(e) => { const arr = [...c.quotes[l]]; arr[i] = e.target.value; setC({ ...c, quotes: { ...c.quotes, [l]: arr } }); }} className={input} />
                    <button onClick={() => setC({ ...c, quotes: { ...c.quotes, [l]: c.quotes[l].filter((_, j) => j !== i) } })} className="rounded-xl border p-2 text-destructive hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => setC({ ...c, quotes: { ...c.quotes, [l]: [...c.quotes[l], ""] } })} className="inline-flex items-center gap-1 text-sm text-primary"><Plus className="h-4 w-4" />إضافة عبارة</button>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<Phone className="h-4 w-4" />} title="أرقام الطوارئ وخطوط الدعم">
          <div className="space-y-2">
            {c.lines.map((line, i) => (
              <div key={i} className="grid gap-2 rounded-2xl bg-muted/50 p-3 md:grid-cols-[1fr_1.4fr_1fr_auto]">
                {(["country", "name", "phone"] as const).map((f) => (
                  <input key={f} placeholder={{ country: "الدولة", name: "اسم الخدمة", phone: "الرقم" }[f]} dir={f === "phone" ? "ltr" : "auto"} value={line[f]}
                    onChange={(e) => { const arr = [...c.lines]; arr[i] = { ...line, [f]: e.target.value }; setC({ ...c, lines: arr }); }} className={input} />
                ))}
                <button onClick={() => setC({ ...c, lines: c.lines.filter((_, j) => j !== i) })} className="rounded-xl border p-2 text-destructive hover:bg-card"><Trash2 className="mx-auto h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => setC({ ...c, lines: [...c.lines, { country: "", name: "", phone: "" }] })} className="inline-flex items-center gap-1 text-sm text-primary"><Plus className="h-4 w-4" />إضافة رقم</button>
          </div>
        </Section>
      </div>
    </div>
  );
}
