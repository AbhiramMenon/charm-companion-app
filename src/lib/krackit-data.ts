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

export const exams: Exam[] = [
  { id: "upsc", name: "UPSC CSE", short: "UPSC", description: "Civil Services Examination", subjects: 12, tricks: 480, accent: "from-amber-400/30 to-amber-700/10" },
  { id: "ssc", name: "SSC CGL", short: "SSC", description: "Staff Selection Commission", subjects: 8, tricks: 320, accent: "from-rose-400/30 to-rose-700/10" },
  { id: "neet", name: "NEET UG", short: "NEET", description: "Medical Entrance Exam", subjects: 6, tricks: 540, accent: "from-emerald-400/30 to-emerald-700/10" },
  { id: "jee", name: "JEE Main", short: "JEE", description: "Engineering Entrance", subjects: 5, tricks: 610, accent: "from-sky-400/30 to-sky-700/10" },
  { id: "cat", name: "CAT", short: "CAT", description: "MBA Entrance Exam", subjects: 4, tricks: 220, accent: "from-violet-400/30 to-violet-700/10" },
  { id: "bank", name: "Banking", short: "IBPS", description: "PO, Clerk & RRB", subjects: 6, tricks: 380, accent: "from-cyan-400/30 to-cyan-700/10" },
];

export const subjects = [
  { id: "history", name: "History", icon: "📜", chapters: 14, exam: "upsc" },
  { id: "polity", name: "Polity", icon: "⚖️", chapters: 22, exam: "upsc" },
  { id: "geo", name: "Geography", icon: "🌍", chapters: 18, exam: "upsc" },
  { id: "eco", name: "Economy", icon: "📈", chapters: 16, exam: "upsc" },
  { id: "sci", name: "Science", icon: "🧪", chapters: 20, exam: "upsc" },
  { id: "env", name: "Environment", icon: "🌱", chapters: 10, exam: "upsc" },
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
    topic: "Medieval India",
  },
  {
    id: "t2",
    title: "Fundamental Rights — Indian Constitution",
    content: "RECREE — 6 Rights",
    explanation:
      "Right to Equality, Right against Exploitation, Cultural & Educational, Religion, Equality before law, Education. Memorize as RECREE.",
    difficulty: "Medium",
    subject: "Polity",
    topic: "Fundamental Rights",
  },
  {
    id: "t3",
    title: "Trigonometric Identities Family",
    content: "SOH-CAH-TOA",
    explanation:
      "Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. The classic — never miss a ratio again.",
    difficulty: "Easy",
    subject: "Maths",
    topic: "Trigonometry",
  },
  {
    id: "t4",
    title: "Order of Planets from Sun",
    content: "My Very Educated Mother Just Served Us Noodles",
    explanation:
      "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. First-letter sentence trick — works every time.",
    difficulty: "Easy",
    subject: "Geography",
    topic: "Solar System",
  },
  {
    id: "t5",
    title: "Krebs Cycle Intermediates",
    content: "Citric Krebs Sirf Sukoon Se Funky Music Online",
    explanation:
      "Citrate → Aconitate → Isocitrate → α-Ketoglutarate → Succinyl-CoA → Succinate → Fumarate → Malate → Oxaloacetate.",
    difficulty: "Hard",
    subject: "Biology",
    topic: "Cellular Respiration",
  },
];
