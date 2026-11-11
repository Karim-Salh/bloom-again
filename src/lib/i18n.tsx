import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./epds";

const dict = {
  en: {
    tagline: "Because Every Mother Deserves to Feel Supported.",
    nav: { home: "Home", screening: "EPDS Screening", mood: "Mood Tracker", help: "Get Help", account: "My progress" },
    emergency: "In crisis or thinking of harming yourself? Call your local emergency number now.",
    emergencyCta: "Emergency help",
    heroTitle: "You are not alone. Bloom again, gently.",
    heroSub: "A calm, science-informed space to understand postpartum feelings, track your mood, and find support — in English and Arabic.",
    ctaScreen: "Take the 2-minute check-in",
    ctaMood: "Log today's mood",
    teaser: "How are you feeling right now?",
    teaserReply: {
      happy: "Hold onto that light — you deserve every bit of it.",
      calm: "Beautiful. Take a slow breath and savour this moment.",
      okay: "Okay is enough. You're doing more than you know.",
      tired: "Rest is not a luxury. Even 10 minutes counts.",
      anxious: "Try breathing in for 4, holding 4, out for 6.",
      sad: "Your feelings are valid. Consider a gentle check-in screening.",
      overwhelmed: "Please reach out to someone today. You don't have to carry this alone.",
    },
    features: [
      ["Validated screening", "The Edinburgh Postnatal Depression Scale, one gentle question at a time."],
      ["Mood journaling", "Log feelings and notes, then see your trends over weeks."],
      ["Safety first", "Immediate guidance and crisis lines whenever you need them."],
    ],
    encouragement: ["Healing isn't linear, and that's okay.", "Asking for help is an act of strength.", "A good mother is not a perfect mother.", "You matter, not just your baby."],
    disclaimer: "Bloom Again offers education and screening only — it is not a medical diagnosis. Always consult a qualified healthcare professional.",
    moods: { happy: "Happy", calm: "Calm", okay: "Okay", tired: "Tired", anxious: "Anxious", sad: "Sad", overwhelmed: "Overwhelmed" },
    screening: {
      title: "EPDS Check-in", intro: "Over the past 7 days, choose the answer closest to how you have felt.", start: "Begin", question: "Question", of: "of", back: "Back", next: "Next", see: "See results",
      result: "Your screening score", loadError: "Unable to load saved progress.", saveError: "Unable to save your screening. Please try again.", low: "Your answers suggest a lower likelihood of depression. Keep caring for yourself, and screen again if things change.",
      possible: "Your answers suggest possible depression. We gently recommend talking to your doctor or midwife.",
      likely: "Your answers suggest depression may be likely. Please contact a healthcare professional soon — support works.",
      safetyTitle: "Your safety matters most", safetyBody: "You indicated thoughts of harming yourself. Please contact emergency services or a crisis line now, or tell someone you trust. You deserve immediate support.",
      retake: "Retake", history: "Previous check-ins", note: "Screening only — not a diagnosis. Results are saved privately on this device.",
    },
    mood: { title: "Mood Tracker", pick: "How do you feel today?", energy: "Energy level", note: "A note for yourself (optional)", save: "Save entry", saved: "Saved. Be gentle with yourself today.", saveError: "Unable to save your entry. Please try again.", loadError: "Unable to load saved progress.", trend: "Your last 14 days", calendar: "This month", empty: "No entries yet — your first log starts your story." },
    account: {
      title: "Your account & progress", intro: "Create an account to keep your mood and screening history available across visits.",
      signIn: "Sign in", signUp: "Create account", email: "Email address", password: "Password", displayName: "Name (optional)",
      submitSignIn: "Sign in", submitSignUp: "Create my account", switchToSignUp: "New here? Create an account", switchToSignIn: "Already have an account? Sign in",
      confirmation: "Check your email for a confirmation link. Your account will be ready after you confirm.",
      signedOutNote: "You can keep using Bloom Again without an account. Progress saved on this device stays private here.",
      profile: "Profile", saveProfile: "Save name", saved: "Saved", signOut: "Sign out", moodEntries: "Mood entries", screenings: "Screenings", latestScore: "Latest screening score",
      importTitle: "Previous progress on this device", importBody: "You have saved progress on this device. Import it into this account? This moves those entries to your account and removes the device-only copy.",
      importButton: "Import device progress", importing: "Importing…", importDone: "Your device progress has been added to your account.", authError: "We couldn't complete that request. Check your details and try again.",
      saveError: "We couldn't save your progress. Please try again.", noProgress: "Your saved progress will appear here.",
    },
    help: { title: "Professional Help & Safety", sub: "If you're in danger, contact emergency services immediately.", lines: "Crisis lines", prep: "Preparing for your doctor visit", prepItems: ["Write down how long you've felt this way", "Note sleep, appetite and mood changes", "Bring your EPDS score", "Bring someone you trust", "List medicines and breastfeeding questions"] },
    lang: "العربية",
  },
  ar: {
    tagline: "لأن كل أم تستحق أن تشعر بالسند والدعم.",
    nav: { home: "الرئيسية", screening: "مقياس إدنبرة", mood: "متتبع المزاج", help: "طلب المساعدة", account: "متابعتي" },
    emergency: "في أزمة أو تفكرين في إيذاء نفسك؟ اتصلي برقم الطوارئ المحلي الآن.",
    emergencyCta: "مساعدة طارئة",
    heroTitle: "لستِ وحدك. ازدهري من جديد، بلطف.",
    heroSub: "مساحة هادئة قائمة على العلم لفهم مشاعر ما بعد الولادة، وتتبع مزاجك، وإيجاد الدعم — بالعربية والإنجليزية.",
    ctaScreen: "ابدئي الفحص في دقيقتين",
    ctaMood: "سجّلي مزاجك اليوم",
    teaser: "كيف تشعرين الآن؟",
    teaserReply: {
      happy: "تمسكي بهذا النور — أنتِ تستحقينه.",
      calm: "جميل. خذي نفسًا عميقًا واستمتعي باللحظة.",
      okay: "أن تكوني بخير يكفي. أنتِ تفعلين أكثر مما تظنين.",
      tired: "الراحة ليست رفاهية. حتى ١٠ دقائق تُحدث فرقًا.",
      anxious: "جرّبي الشهيق ٤ ثوانٍ، الحبس ٤، والزفير ٦.",
      sad: "مشاعرك مشروعة. فكري في إجراء فحص لطيف.",
      overwhelmed: "تواصلي مع أحد اليوم. لستِ مضطرة لحمل هذا وحدك.",
    },
    features: [
      ["فحص معتمد", "مقياس إدنبرة لاكتئاب ما بعد الولادة، سؤال واحد في كل مرة."],
      ["مذكرات المزاج", "سجّلي مشاعرك وملاحظاتك وتابعي تطورها عبر الأسابيع."],
      ["الأمان أولًا", "إرشادات فورية وخطوط دعم متى احتجتِ إليها."],
    ],
    encouragement: ["التعافي ليس خطًا مستقيمًا، وهذا طبيعي.", "طلب المساعدة قوة.", "الأم الجيدة ليست أمًا مثالية.", "أنتِ مهمة، وليس طفلك فقط."],
    disclaimer: "تقدم Bloom Again التوعية والفحص فقط — وليست تشخيصًا طبيًا. استشيري دائمًا مختصًا صحيًا مؤهلًا.",
    moods: { happy: "سعيدة", calm: "هادئة", okay: "بخير", tired: "متعبة", anxious: "قلقة", sad: "حزينة", overwhelmed: "مُرهقة" },
    screening: {
      title: "فحص إدنبرة", intro: "خلال الأيام السبعة الماضية، اختاري الإجابة الأقرب لما شعرتِ به.", start: "ابدئي", question: "السؤال", of: "من", back: "السابق", next: "التالي", see: "عرض النتيجة",
      result: "نتيجة الفحص", loadError: "تعذر تحميل تقدمك المحفوظ.", saveError: "تعذر حفظ نتيجة الفحص. حاولي مرة أخرى.", low: "تشير إجاباتك إلى احتمال منخفض للاكتئاب. استمري في الاهتمام بنفسك وأعيدي الفحص إن تغيرت الأمور.",
      possible: "تشير إجاباتك إلى احتمال وجود اكتئاب. ننصحك بلطف بالتحدث مع طبيبتك أو القابلة.",
      likely: "تشير إجاباتك إلى أن الاكتئاب محتمل. يرجى التواصل مع مختص صحي قريبًا — الدعم يُحدث فرقًا.",
      safetyTitle: "سلامتك هي الأهم", safetyBody: "أشرتِ إلى أفكار عن إيذاء النفس. يرجى الاتصال بالطوارئ أو خط دعم الأزمات الآن، أو إخبار شخص تثقين به. أنتِ تستحقين الدعم فورًا.",
      retake: "إعادة الفحص", history: "الفحوصات السابقة", note: "فحص فقط — وليس تشخيصًا. تُحفظ النتائج بشكل خاص على هذا الجهاز.",
    },
    mood: { title: "متتبع المزاج", pick: "كيف تشعرين اليوم؟", energy: "مستوى الطاقة", note: "ملاحظة لنفسك (اختياري)", save: "حفظ", saved: "تم الحفظ. كوني لطيفة مع نفسك اليوم.", saveError: "تعذر حفظ تسجيلك. حاولي مرة أخرى.", loadError: "تعذر تحميل تقدمك المحفوظ.", trend: "آخر ١٤ يومًا", calendar: "هذا الشهر", empty: "لا توجد تسجيلات بعد — أول تسجيل يبدأ قصتك." },
    account: {
      title: "حسابك ومتابعتك", intro: "أنشئي حسابًا للاحتفاظ بسجل المزاج والفحوصات ومتابعته في زياراتك القادمة.",
      signIn: "تسجيل الدخول", signUp: "إنشاء حساب", email: "البريد الإلكتروني", password: "كلمة المرور", displayName: "الاسم (اختياري)",
      submitSignIn: "دخول", submitSignUp: "إنشاء حسابي", switchToSignUp: "جديدة هنا؟ أنشئي حسابًا", switchToSignIn: "لديك حساب؟ سجّلي الدخول",
      confirmation: "تحققي من بريدك الإلكتروني واضغطي رابط التأكيد. سيصبح حسابك جاهزًا بعد التأكيد.",
      signedOutNote: "يمكنك استخدام Bloom Again دون حساب. يبقى التقدم المحفوظ على هذا الجهاز خاصًا به.",
      profile: "الملف الشخصي", saveProfile: "حفظ الاسم", saved: "تم الحفظ", signOut: "تسجيل الخروج", moodEntries: "تسجيلات المزاج", screenings: "الفحوصات", latestScore: "آخر نتيجة فحص",
      importTitle: "تقدم سابق على هذا الجهاز", importBody: "لديك تقدم محفوظ على هذا الجهاز. هل تريدين نقله إلى هذا الحساب؟ ستُنقل السجلات إلى حسابك وتُحذف النسخة المحفوظة على الجهاز.",
      importButton: "نقل تقدم الجهاز", importing: "جارٍ النقل…", importDone: "تمت إضافة تقدم الجهاز إلى حسابك.", authError: "تعذر إكمال الطلب. تحققي من البيانات وحاولي مرة أخرى.",
      saveError: "تعذر حفظ تقدمك. حاولي مرة أخرى.", noProgress: "سيظهر تقدمك المحفوظ هنا.",
    },
    help: { title: "المساعدة المتخصصة والأمان", sub: "إذا كنتِ في خطر، اتصلي بخدمات الطوارئ فورًا.", lines: "خطوط الأزمات", prep: "الاستعداد لزيارة الطبيب", prepItems: ["اكتبي منذ متى تشعرين بذلك", "دوّني تغيرات النوم والشهية والمزاج", "أحضري نتيجة مقياس إدنبرة", "اصطحبي شخصًا تثقين به", "اكتبي الأدوية وأسئلة الرضاعة"] },
    lang: "English",
  },
};

export type Dict = (typeof dict)["en"];
const Ctx = createContext<{ lang: Lang; t: Dict; toggle: () => void }>({ lang: "en", t: dict.en, toggle: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("bloom-lang");
    if (saved === "ar" || saved === "en") setLang(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("bloom-lang", lang);
  }, [lang]);
  return <Ctx.Provider value={{ lang, t: dict[lang] as Dict, toggle: () => setLang((l) => (l === "en" ? "ar" : "en")) }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
