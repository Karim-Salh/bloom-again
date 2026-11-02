// Edinburgh Postnatal Depression Scale (Cox, Holden & Sagovsky, 1987).
// Items 1, 2, 4 score 0→3 top-to-bottom; items 3, 5–10 are reverse-scored (3→0).
export type Lang = "en" | "ar";

type Item = { q: Record<Lang, string>; options: Record<Lang, string[]>; reverse: boolean };

export const EPDS_ITEMS: Item[] = [
  { reverse: false, q: { en: "I have been able to laugh and see the funny side of things", ar: "كنت قادرة على الضحك ورؤية الجانب المضحك من الأمور" },
    options: { en: ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"], ar: ["بقدر ما كنت دائمًا", "ليس بنفس القدر الآن", "بالتأكيد أقل بكثير الآن", "إطلاقًا"] } },
  { reverse: false, q: { en: "I have looked forward with enjoyment to things", ar: "كنت أتطلع بسرور إلى الأشياء" },
    options: { en: ["As much as I ever did", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"], ar: ["بقدر ما كنت دائمًا", "أقل قليلًا مما اعتدت", "بالتأكيد أقل مما اعتدت", "نادرًا جدًا"] } },
  { reverse: true, q: { en: "I have blamed myself unnecessarily when things went wrong", ar: "لُمت نفسي دون داعٍ عندما سارت الأمور بشكل خاطئ" },
    options: { en: ["Yes, most of the time", "Yes, some of the time", "Not very often", "No, never"], ar: ["نعم، معظم الوقت", "نعم، بعض الوقت", "ليس كثيرًا", "لا، أبدًا"] } },
  { reverse: false, q: { en: "I have been anxious or worried for no good reason", ar: "شعرت بالقلق أو الانزعاج دون سبب وجيه" },
    options: { en: ["No, not at all", "Hardly ever", "Yes, sometimes", "Yes, very often"], ar: ["لا، إطلاقًا", "نادرًا جدًا", "نعم، أحيانًا", "نعم، كثيرًا جدًا"] } },
  { reverse: true, q: { en: "I have felt scared or panicky for no very good reason", ar: "شعرت بالخوف أو الذعر دون سبب وجيه" },
    options: { en: ["Yes, quite a lot", "Yes, sometimes", "No, not much", "No, not at all"], ar: ["نعم، كثيرًا", "نعم، أحيانًا", "لا، ليس كثيرًا", "لا، إطلاقًا"] } },
  { reverse: true, q: { en: "Things have been getting on top of me", ar: "تراكمت عليّ الأمور وشعرت بالإرهاق" },
    options: { en: ["Yes, most of the time I haven't been able to cope at all", "Yes, sometimes I haven't been coping as well as usual", "No, most of the time I have coped quite well", "No, I have been coping as well as ever"], ar: ["نعم، معظم الوقت لم أستطع التأقلم إطلاقًا", "نعم، أحيانًا لم أتأقلم كالمعتاد", "لا، معظم الوقت تأقلمت جيدًا", "لا، أتأقلم كما كنت دائمًا"] } },
  { reverse: true, q: { en: "I have been so unhappy that I have had difficulty sleeping", ar: "كنت حزينة لدرجة أنني واجهت صعوبة في النوم" },
    options: { en: ["Yes, most of the time", "Yes, sometimes", "Not very often", "No, not at all"], ar: ["نعم، معظم الوقت", "نعم، أحيانًا", "ليس كثيرًا", "لا، إطلاقًا"] } },
  { reverse: true, q: { en: "I have felt sad or miserable", ar: "شعرت بالحزن أو التعاسة" },
    options: { en: ["Yes, most of the time", "Yes, quite often", "Not very often", "No, not at all"], ar: ["نعم، معظم الوقت", "نعم، كثيرًا", "ليس كثيرًا", "لا، إطلاقًا"] } },
  { reverse: true, q: { en: "I have been so unhappy that I have been crying", ar: "كنت حزينة لدرجة أنني كنت أبكي" },
    options: { en: ["Yes, most of the time", "Yes, quite often", "Only occasionally", "No, never"], ar: ["نعم، معظم الوقت", "نعم، كثيرًا", "أحيانًا فقط", "لا، أبدًا"] } },
  { reverse: true, q: { en: "The thought of harming myself has occurred to me", ar: "خطرت لي فكرة إيذاء نفسي" },
    options: { en: ["Yes, quite often", "Sometimes", "Hardly ever", "Never"], ar: ["نعم، كثيرًا", "أحيانًا", "نادرًا جدًا", "أبدًا"] } },
];

/** Score for option index (0 = top option) of a given item. */
export function itemScore(itemIndex: number, optionIndex: number): number {
  return EPDS_ITEMS[itemIndex].reverse ? 3 - optionIndex : optionIndex;
}

export type EpdsResult = { total: number; safety: boolean; level: "low" | "possible" | "likely" };

/** answers = selected option index per item. */
export function scoreEpds(answers: number[]): EpdsResult {
  const scores = answers.map((a, i) => itemScore(i, a));
  const total = scores.reduce((s, n) => s + n, 0);
  const safety = (scores[9] ?? 0) > 0;
  const level = total >= 13 ? "likely" : total >= 10 ? "possible" : "low";
  return { total, safety, level };
}
