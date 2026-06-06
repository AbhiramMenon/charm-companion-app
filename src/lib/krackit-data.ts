export type Trick = {
  id: string;
  title: string;
  content: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subject: string;
  topic: string;
};

export type Exam = {
  id: string;
  name: string;
  short: string;
  description: string;
  subjects: number;
  tricks: number;
  accent: string;
};

export type Subject = {
  id: string;
  name: string;
  icon: string;
  chapters: number;
  examId: string;
  color: string;
};

export type Chapter = {
  id: string;
  name: string;
  subjectId: string;
  tricksCount: number;
  progress: number; // 0..1
};

export const exams: Exam[] = [
  { id: "upsc", name: "UPSC CSE", short: "UPSC", description: "Civil Services Examination", subjects: 6, tricks: 480, accent: "from-amber-400/30 to-amber-700/10" },
  { id: "ssc", name: "SSC CGL", short: "SSC", description: "Staff Selection Commission", subjects: 6, tricks: 320, accent: "from-rose-400/30 to-rose-700/10" },
  { id: "neet", name: "NEET UG", short: "NEET", description: "Medical Entrance Exam", subjects: 6, tricks: 540, accent: "from-emerald-400/30 to-emerald-700/10" },
  { id: "jee", name: "JEE Main", short: "JEE", description: "Engineering Entrance", subjects: 6, tricks: 610, accent: "from-sky-400/30 to-sky-700/10" },
  { id: "cat", name: "CAT", short: "CAT", description: "MBA Entrance Exam", subjects: 4, tricks: 220, accent: "from-violet-400/30 to-violet-700/10" },
  { id: "bank", name: "Banking", short: "IBPS", description: "PO, Clerk & RRB", subjects: 6, tricks: 380, accent: "from-cyan-400/30 to-cyan-700/10" },
];

export type ExamNews = {
  id: string;
  exam: string;
  title: string;
  date: string;
  tag: "Notification" | "Admit Card" | "Result" | "Exam Date";
  accent: string;
};

export const examNews: ExamNews[] = [
  { id: "n1", exam: "UPSC", title: "CSE Prelims 2026 notification released", date: "Feb 14", tag: "Notification", accent: "from-amber-500/30 to-amber-900/10" },
  { id: "n2", exam: "NEET", title: "NEET UG admit cards out next week", date: "Apr 28", tag: "Admit Card", accent: "from-emerald-500/30 to-emerald-900/10" },
  { id: "n3", exam: "SSC", title: "CGL Tier 1 exam dates announced", date: "Jun 09", tag: "Exam Date", accent: "from-rose-500/30 to-rose-900/10" },
  { id: "n4", exam: "JEE", title: "JEE Main Session 2 results declared", date: "May 02", tag: "Result", accent: "from-sky-500/30 to-sky-900/10" },
  { id: "n5", exam: "IBPS", title: "PO 2026 prelims notification live", date: "Jul 18", tag: "Notification", accent: "from-cyan-500/30 to-cyan-900/10" },
];

export const subjects: Subject[] = [
  { id: "history", name: "History", icon: "📜", chapters: 14, examId: "upsc", color: "from-amber-500/25 to-amber-900/5" },
  { id: "polity", name: "Polity", icon: "⚖️", chapters: 22, examId: "upsc", color: "from-rose-500/25 to-rose-900/5" },
  { id: "geo", name: "Geography", icon: "🌍", chapters: 18, examId: "upsc", color: "from-emerald-500/25 to-emerald-900/5" },
  { id: "eco", name: "Economy", icon: "📈", chapters: 16, examId: "upsc", color: "from-sky-500/25 to-sky-900/5" },
  { id: "sci", name: "Science & Tech", icon: "🧪", chapters: 20, examId: "upsc", color: "from-violet-500/25 to-violet-900/5" },
  { id: "env", name: "Environment", icon: "🌱", chapters: 10, examId: "upsc", color: "from-cyan-500/25 to-cyan-900/5" },
  // generic placeholders for other exams
  { id: "qa", name: "Quant Aptitude", icon: "🔢", chapters: 18, examId: "ssc", color: "from-amber-500/25 to-amber-900/5" },
  { id: "rea", name: "Reasoning", icon: "🧩", chapters: 14, examId: "ssc", color: "from-rose-500/25 to-rose-900/5" },
  { id: "eng", name: "English", icon: "🔤", chapters: 12, examId: "ssc", color: "from-sky-500/25 to-sky-900/5" },
  { id: "ga", name: "General Awareness", icon: "🌐", chapters: 16, examId: "ssc", color: "from-emerald-500/25 to-emerald-900/5" },
  { id: "phy", name: "Physics", icon: "⚛️", chapters: 20, examId: "neet", color: "from-sky-500/25 to-sky-900/5" },
  { id: "chem", name: "Chemistry", icon: "⚗️", chapters: 22, examId: "neet", color: "from-emerald-500/25 to-emerald-900/5" },
  { id: "bio", name: "Biology", icon: "🧬", chapters: 24, examId: "neet", color: "from-rose-500/25 to-rose-900/5" },
];

export const chapters: Chapter[] = [
  // History
  { id: "anc", name: "Ancient India", subjectId: "history", tricksCount: 18, progress: 0.7 },
  { id: "med", name: "Medieval India", subjectId: "history", tricksCount: 22, progress: 0.45 },
  { id: "mod", name: "Modern India", subjectId: "history", tricksCount: 28, progress: 0.2 },
  { id: "world", name: "World History", subjectId: "history", tricksCount: 14, progress: 0 },
  // Polity
  { id: "fr", name: "Fundamental Rights", subjectId: "polity", tricksCount: 16, progress: 0.85 },
  { id: "dpsp", name: "DPSP", subjectId: "polity", tricksCount: 12, progress: 0.5 },
  { id: "parl", name: "Parliament", subjectId: "polity", tricksCount: 20, progress: 0.15 },
  { id: "jud", name: "Judiciary", subjectId: "polity", tricksCount: 18, progress: 0 },
  // Geography
  { id: "phys", name: "Physical Geography", subjectId: "geo", tricksCount: 24, progress: 0.3 },
  { id: "ind", name: "Indian Geography", subjectId: "geo", tricksCount: 20, progress: 0.6 },
  { id: "ss", name: "Solar System", subjectId: "geo", tricksCount: 10, progress: 0.4 },
];

export const tricks: Trick[] = [
  {
    id: "t1",
    title: "Remember Mughal Emperors in Order",
    content: "BHAJI SABJI FAM",
    explanation:
      "Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb. A spicy mnemonic that sticks because it sounds like an Indian kitchen order.",
    difficulty: "Easy",
    subject: "History",
    topic: "med",
  },
  {
    id: "t2",
    title: "Fundamental Rights — Indian Constitution",
    content: "RECREE — 6 Rights",
    explanation:
      "Right to Equality, Right against Exploitation, Cultural & Educational, Religion, Equality before law, Education. Memorize as RECREE.",
    difficulty: "Medium",
    subject: "Polity",
    topic: "fr",
  },
  {
    id: "t3",
    title: "Trigonometric Identities Family",
    content: "SOH-CAH-TOA",
    explanation:
      "Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. The classic — never miss a ratio again.",
    difficulty: "Easy",
    subject: "Maths",
    topic: "trig",
  },
  {
    id: "t4",
    title: "Order of Planets from Sun",
    content: "My Very Educated Mother Just Served Us Noodles",
    explanation:
      "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. First-letter sentence trick — works every time.",
    difficulty: "Easy",
    subject: "Geography",
    topic: "ss",
  },
  {
    id: "t5",
    title: "Krebs Cycle Intermediates",
    content: "Citric Krebs Sirf Sukoon Se Funky Music Online",
    explanation:
      "Citrate → Aconitate → Isocitrate → α-Ketoglutarate → Succinyl-CoA → Succinate → Fumarate → Malate → Oxaloacetate.",
    difficulty: "Hard",
    subject: "Biology",
    topic: "bio-resp",
  },
  {
    id: "t6",
    title: "Maurya Dynasty Rulers",
    content: "Chandragupta Built A Bigger Dasharatha",
    explanation:
      "Chandragupta → Bindusara → Ashoka → Dasharatha. Sentence keeps the order locked in.",
    difficulty: "Medium",
    subject: "History",
    topic: "anc",
  },
  {
    id: "t7",
    title: "Delhi Sultanate Dynasties",
    content: "Slave Khilji Tughlaq Sayyid Lodi",
    explanation:
      "The five dynasties of the Delhi Sultanate in chronological order. Pure rhythm — say it 3 times and it sticks.",
    difficulty: "Easy",
    subject: "History",
    topic: "med",
  },
];
