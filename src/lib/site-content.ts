import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type L = { en: string; ar: string };
export type CrisisLine = { country: string; name: string; phone: string };
export type SiteContent = {
  banner: { enabled: boolean; text: L; linkLabel: L; link: string };
  heroTitle: L;
  heroSub: L;
  quotes: { en: string[]; ar: string[] };
  lines: CrisisLine[];
};

export const DEFAULT_CONTENT: SiteContent = {
  banner: {
    enabled: true,
    text: { en: "New: take the free EPDS check-in in under 2 minutes 🌿", ar: "جديد: أجري فحص إدنبرة المجاني في أقل من دقيقتين 🌿" },
    linkLabel: { en: "Start now", ar: "ابدئي الآن" },
    link: "/screening",
  },
  heroTitle: { en: "You are not alone. Bloom again, gently.", ar: "لستِ وحدك. ازدهري من جديد، بلطف." },
  heroSub: {
    en: "A calm, science-informed space to understand postpartum feelings, track your mood, and find support — in English and Arabic.",
    ar: "مساحة هادئة قائمة على العلم لفهم مشاعر ما بعد الولادة، وتتبع مزاجك، وإيجاد الدعم — بالعربية والإنجليزية.",
  },
  quotes: {
    en: ["Healing isn't linear, and that's okay.", "Asking for help is an act of strength.", "A good mother is not a perfect mother.", "You matter, not just your baby."],
    ar: ["التعافي ليس خطًا مستقيمًا، وهذا طبيعي.", "طلب المساعدة قوة.", "الأم الجيدة ليست أمًا مثالية.", "أنتِ مهمة، وليس طفلك فقط."],
  },
  lines: [
    { country: "Egypt / مصر", name: "Mental Health Hotline", phone: "08008880700" },
    { country: "Egypt / مصر", name: "Emergency / الإسعاف", phone: "123" },
    { country: "Saudi Arabia / السعودية", name: "Mental health support (937)", phone: "937" },
    { country: "UAE / الإمارات", name: "Emergency / الطوارئ", phone: "999" },
    { country: "USA", name: "Postpartum Support International", phone: "18009444773" },
    { country: "USA", name: "988 Suicide & Crisis Lifeline", phone: "988" },
    { country: "UK", name: "Samaritans", phone: "116123" },
  ],
};

/** Saved admin content layered over defaults so missing fields never break the site. */
export function mergeContent(saved: Partial<SiteContent> | null | undefined): SiteContent {
  const s = saved ?? {};
  return {
    ...DEFAULT_CONTENT,
    ...s,
    banner: { ...DEFAULT_CONTENT.banner, ...(s.banner ?? {}) },
    quotes: { ...DEFAULT_CONTENT.quotes, ...(s.quotes ?? {}) },
  } as SiteContent;
}

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: async () => {
    const { data } = await supabase.from("site_settings").select("content").eq("id", "main").maybeSingle();
    return mergeContent(data?.content as Partial<SiteContent>);
  },
  staleTime: 60_000,
});

export function useSiteContent() {
  return useQuery(siteContentQuery).data ?? DEFAULT_CONTENT;
}
