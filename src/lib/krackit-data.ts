export type Trick = {
  id: string;
  title: string;
  content: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subject: string;
  topic: string; // Topic.id
};

export type Topic = {
  id: string;
  name: string;
  chapterId: string;
  tricksCount: number;
  icon?: string;
};

export type Exam = {
  id: string;
  name: string;
  short: string;
  description: string;
  subjects: number;
  tricks: number;
  accent: string;
  examDate?: string;
  medium?: 'hindi' | 'english';
  imageUrl?: string;
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
  progress: number; // 0..1 (computed dynamically from mastered)
  icon?: string;
};

export type ShortNote = {
  id: string;
  topicId: string;
  title: string;
  content: string;
  isCustom?: boolean;
};

export type TopicMap = {
  id: string;
  topicId: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
};

export type ExamNews = {
  id: string;
  exam: string;
  title: string;
  date: string;
  tag: "Notification" | "Admit Card" | "Result" | "Exam Date";
  accent: string;
};

export const exams: Exam[] = [
  { id: "upsc", name: "UPSC CSE", short: "UPSC", description: "Civil Services Examination", subjects: 6, tricks: 480, accent: "from-amber-400/30 to-amber-700/10" },
  { id: "ssc", name: "SSC CGL", short: "SSC", description: "Staff Selection Commission", subjects: 6, tricks: 320, accent: "from-rose-400/30 to-rose-700/10" },
  { id: "neet", name: "NEET UG", short: "NEET", description: "Medical Entrance Exam", subjects: 6, tricks: 540, accent: "from-emerald-400/30 to-emerald-700/10" },
  { id: "jee", name: "JEE Main", short: "JEE", description: "Engineering Entrance", subjects: 6, tricks: 610, accent: "from-sky-400/30 to-sky-700/10" },
  { id: "cat", name: "CAT", short: "CAT", description: "MBA Entrance Exam", subjects: 4, tricks: 220, accent: "from-violet-400/30 to-violet-700/10" },
  { id: "bank", name: "Banking", short: "IBPS", description: "PO, Clerk & RRB", subjects: 6, tricks: 380, accent: "from-cyan-400/30 to-cyan-700/10" },
];

export const examNews: ExamNews[] = [
  { id: "n1", exam: "UPSC", title: "CSE Prelims 2026 notification released", date: "Feb 14", tag: "Notification", accent: "from-amber-500/30 to-amber-900/10" },
  { id: "n2", exam: "NEET", title: "NEET UG admit cards out next week", date: "Apr 28", tag: "Admit Card", accent: "from-emerald-500/30 to-emerald-900/10" },
  { id: "n3", exam: "SSC", title: "CGL Tier 1 exam dates announced", date: "Jun 09", tag: "Exam Date", accent: "from-rose-500/30 to-rose-900/10" },
  { id: "n4", exam: "JEE", title: "JEE Main Session 2 results declared", date: "May 02", tag: "Result", accent: "from-sky-500/30 to-sky-900/10" },
  { id: "n5", exam: "IBPS", title: "PO 2026 prelims notification live", date: "Jul 18", tag: "Notification", accent: "from-cyan-500/30 to-cyan-900/10" },
];

export const subjects: Subject[] = [
  { id: "history", name: "History", icon: "📜", chapters: 4, examId: "upsc", color: "from-amber-500/25 to-amber-900/5" },
  { id: "polity", name: "Polity", icon: "⚖️", chapters: 4, examId: "upsc", color: "from-rose-500/25 to-rose-900/5" },
  { id: "geo", name: "Geography", icon: "🌍", chapters: 3, examId: "upsc", color: "from-emerald-500/25 to-emerald-900/5" },
  { id: "eco", name: "Economy", icon: "📈", chapters: 16, examId: "upsc", color: "from-sky-500/25 to-sky-900/5" },
  { id: "sci", name: "Science & Tech", icon: "🧪", chapters: 20, examId: "upsc", color: "from-violet-500/25 to-violet-900/5" },
  { id: "env", name: "Environment", icon: "🌱", chapters: 10, examId: "upsc", color: "from-cyan-500/25 to-cyan-900/5" },
  { id: "qa", name: "Quant Aptitude", icon: "🔢", chapters: 3, examId: "ssc", color: "from-amber-500/25 to-amber-900/5" },
  { id: "rea", name: "Reasoning", icon: "🧩", chapters: 14, examId: "ssc", color: "from-rose-500/25 to-rose-900/5" },
  { id: "eng", name: "English", icon: "🔤", chapters: 12, examId: "ssc", color: "from-sky-500/25 to-sky-900/5" },
  { id: "ga", name: "General Awareness", icon: "🌐", chapters: 16, examId: "ssc", color: "from-emerald-500/25 to-emerald-900/5" },
  { id: "phy", name: "Physics", icon: "⚛️", chapters: 20, examId: "neet", color: "from-sky-500/25 to-sky-900/5" },
  { id: "chem", name: "Chemistry", icon: "⚗️", chapters: 22, examId: "neet", color: "from-emerald-500/25 to-emerald-900/5" },
  { id: "bio", name: "Biology", icon: "🧬", chapters: 3, examId: "neet", color: "from-rose-500/25 to-rose-900/5" },
];

export const chapters: Chapter[] = [
  // History
  { id: "anc",        name: "Ancient India",          subjectId: "history", tricksCount: 4,  progress: 0, icon: "🏺" },
  { id: "med",        name: "Medieval India",          subjectId: "history", tricksCount: 3,  progress: 0, icon: "🏰" },
  { id: "mod",        name: "Modern India",            subjectId: "history", tricksCount: 8,  progress: 0, icon: "✊" },
  { id: "world",      name: "World History",           subjectId: "history", tricksCount: 6,  progress: 0, icon: "🌍" },
  // Polity
  { id: "fr",         name: "Fundamental Rights",      subjectId: "polity",  tricksCount: 3,  progress: 0, icon: "⚖️" },
  { id: "dpsp",       name: "DPSP",                    subjectId: "polity",  tricksCount: 4,  progress: 0, icon: "📜" },
  { id: "parl",       name: "Parliament",              subjectId: "polity",  tricksCount: 5,  progress: 0, icon: "🏛️" },
  { id: "jud",        name: "Judiciary",               subjectId: "polity",  tricksCount: 4,  progress: 0, icon: "👨‍⚖️" },
  // Geography
  { id: "phys",       name: "Physical Geography",      subjectId: "geo",     tricksCount: 6,  progress: 0, icon: "🗺️" },
  { id: "ind",        name: "Indian Geography",        subjectId: "geo",     tricksCount: 5,  progress: 0, icon: "🇮🇳" },
  { id: "ss",         name: "Solar System",            subjectId: "geo",     tricksCount: 3,  progress: 0, icon: "🌌" },
  // Quant Aptitude
  { id: "trig-ch",    name: "Trigonometry",            subjectId: "qa",      tricksCount: 4,  progress: 0, icon: "📐" },
  { id: "alg-ch",     name: "Algebra",                 subjectId: "qa",      tricksCount: 5,  progress: 0, icon: "✏️" },
  { id: "arith-ch",   name: "Arithmetic",              subjectId: "qa",      tricksCount: 6,  progress: 0, icon: "🔢" },
  // Biology
  { id: "cell-ch",    name: "Cell Biology",            subjectId: "bio",     tricksCount: 5,  progress: 0, icon: "🧫" },
  { id: "bio-resp-ch",name: "Cellular Respiration",    subjectId: "bio",     tricksCount: 4,  progress: 0, icon: "⚡" },
  { id: "genetics-ch",name: "Genetics",                subjectId: "bio",     tricksCount: 6,  progress: 0, icon: "🧬" },
];

export const topics: Topic[] = [
  // Ancient India
  { id: "anc-indus",     name: "Indus Valley Civilization",  chapterId: "anc",        tricksCount: 1, icon: "🌊" },
  { id: "anc-vedic",     name: "Vedic Period",               chapterId: "anc",        tricksCount: 1, icon: "🕉️" },
  { id: "anc-maurya",    name: "Mauryan Empire",             chapterId: "anc",        tricksCount: 1, icon: "🦁" },
  { id: "anc-gupta",     name: "Gupta Period",               chapterId: "anc",        tricksCount: 1, icon: "✨" },
  // Medieval India
  { id: "med-delhi",     name: "Delhi Sultanate",            chapterId: "med",        tricksCount: 1, icon: "🕌" },
  { id: "med-mughal",    name: "Mughal Empire",              chapterId: "med",        tricksCount: 1, icon: "👑" },
  { id: "med-south",     name: "South Indian Kingdoms",      chapterId: "med",        tricksCount: 1, icon: "🛕" },
  // Modern India
  { id: "mod-revolt",    name: "1857 Revolt",                chapterId: "mod",        tricksCount: 2, icon: "⚔️" },
  { id: "mod-movements", name: "Freedom Movements",          chapterId: "mod",        tricksCount: 2, icon: "🕊️" },
  { id: "mod-leaders",   name: "National Leaders",           chapterId: "mod",        tricksCount: 2, icon: "🧑‍💼" },
  { id: "mod-acts",      name: "Important Acts",             chapterId: "mod",        tricksCount: 2, icon: "📋" },
  // World History
  { id: "wh-wars",       name: "World Wars",                 chapterId: "world",      tricksCount: 2, icon: "🪖" },
  { id: "wh-revolutions",name: "Revolutions",                chapterId: "world",      tricksCount: 2, icon: "🔥" },
  { id: "wh-orgs",       name: "International Orgs",         chapterId: "world",      tricksCount: 2, icon: "🌐" },
  // Fundamental Rights
  { id: "fr-rights",     name: "6 Fundamental Rights",       chapterId: "fr",         tricksCount: 1, icon: "🛡️" },
  { id: "fr-duties",     name: "Fundamental Duties",         chapterId: "fr",         tricksCount: 1, icon: "📌" },
  { id: "fr-amend",      name: "Key Amendments",             chapterId: "fr",         tricksCount: 1, icon: "📝" },
  // DPSP
  { id: "dpsp-art",      name: "DPSP Articles",              chapterId: "dpsp",       tricksCount: 2, icon: "📖" },
  { id: "dpsp-types",    name: "Types of Directives",        chapterId: "dpsp",       tricksCount: 2, icon: "🗂️" },
  // Parliament
  { id: "parl-lok",      name: "Lok Sabha",                  chapterId: "parl",       tricksCount: 2, icon: "🏛️" },
  { id: "parl-rajya",    name: "Rajya Sabha",                chapterId: "parl",       tricksCount: 2, icon: "🏛️" },
  { id: "parl-sessions", name: "Parliamentary Sessions",     chapterId: "parl",       tricksCount: 1, icon: "🗓️" },
  // Judiciary
  { id: "jud-sc",        name: "Supreme Court",              chapterId: "jud",        tricksCount: 2, icon: "⚖️" },
  { id: "jud-hc",        name: "High Courts",                chapterId: "jud",        tricksCount: 2, icon: "🏛️" },
  // Solar System
  { id: "ss-planets",    name: "Planets & Order",            chapterId: "ss",         tricksCount: 1, icon: "🪐" },
  { id: "ss-moon",       name: "Moon & Satellites",          chapterId: "ss",         tricksCount: 1, icon: "🌙" },
  { id: "ss-misc",       name: "Stars & Phenomena",          chapterId: "ss",         tricksCount: 1, icon: "⭐" },
  // Trigonometry
  { id: "trig",          name: "Trig Ratios (SOH-CAH-TOA)",  chapterId: "trig-ch",    tricksCount: 1, icon: "📐" },
  { id: "trig-ids",      name: "Trig Identities",            chapterId: "trig-ch",    tricksCount: 2, icon: "🔁" },
  { id: "trig-graphs",   name: "Trig Graphs",                chapterId: "trig-ch",    tricksCount: 1, icon: "📈" },
  // Biology
  { id: "bio-resp",      name: "Krebs Cycle",                chapterId: "bio-resp-ch",tricksCount: 1, icon: "🔄" },
  { id: "bio-glyco",     name: "Glycolysis",                 chapterId: "bio-resp-ch",tricksCount: 2, icon: "🍬" },
  { id: "bio-atp",       name: "ATP Synthesis",              chapterId: "bio-resp-ch",tricksCount: 1, icon: "⚡" },
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
    topic: "med-mughal",
  },
  {
    id: "t2",
    title: "Fundamental Rights — Indian Constitution",
    content: "RECREE — 6 Rights",
    explanation:
      "Right to Equality, Right against Exploitation, Cultural & Educational, Religion, Equality before law, Education. Memorize as RECREE.",
    difficulty: "Medium",
    subject: "Polity",
    topic: "fr-rights",
  },
  {
    id: "t3",
    title: "Trigonometric Identities (SOH-CAH-TOA)",
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
    topic: "ss-planets",
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
    topic: "anc-maurya",
  },
  {
    id: "t7",
    title: "Delhi Sultanate Dynasties",
    content: "Slave Khilji Tughlaq Sayyid Lodi",
    explanation:
      "The five dynasties of the Delhi Sultanate in chronological order. Pure rhythm — say it 3 times and it sticks.",
    difficulty: "Easy",
    subject: "History",
    topic: "med-delhi",
  },
  {
    id: "t8",
    title: "Indus Valley Cities — Location",
    content: "MoHen Harappa Kalibangan Lothal",
    explanation:
      "Mohenjo-daro (Sindh), Harappa (Punjab), Kalibangan (Rajasthan), Lothal (Gujarat). Each city had a distinct feature — granaries, bead factories, dockyard.",
    difficulty: "Medium",
    subject: "History",
    topic: "anc-indus",
  },
  {
    id: "t9",
    title: "Four Vedas in Order",
    content: "Rig Sama Yajur Atharva — RSYA",
    explanation:
      "Rigveda (hymns), Samaveda (melodies), Yajurveda (rituals), Atharvaveda (charms). Acronym RSYA helps recall all four instantly.",
    difficulty: "Easy",
    subject: "History",
    topic: "anc-vedic",
  },
  {
    id: "t10",
    title: "Gupta Period Literary Works",
    content: "Kalidasa Wrote Great Stories for All",
    explanation:
      "Kalidasa — Abhijnanasakuntalam, Meghaduta. Aryabhatta — Aryabhatiya. Vishakhadatta — Mudrarakshasa. Golden Age of art, science and literature.",
    difficulty: "Medium",
    subject: "History",
    topic: "anc-gupta",
  },
  {
    id: "t11",
    title: "Directive Principles — Key Articles",
    content: "36 to 51 — DPSP Range",
    explanation:
      "Articles 36 to 51 cover Directive Principles of State Policy. They are non-justiciable but fundamental for governance. Think '36 steps to 51 goals'.",
    difficulty: "Easy",
    subject: "Polity",
    topic: "dpsp-art",
  },
  {
    id: "t12",
    title: "Fundamental Duties — Article 51A",
    content: "51A has 11 duties — Remember: SAVE RRN UPDF",
    explanation:
      "Sovereignty, Abolish discriminating, Vigilance, Environment, Renounce violence, Respect culture, Natural environment, Unity, Public property, Develop scientific temper, Free compulsory education.",
    difficulty: "Hard",
    subject: "Polity",
    topic: "fr-duties",
  },
];

export const shortNotes: ShortNote[] = [
  // Mughal Empire
  { id: "sn1",  topicId: "med-mughal",  title: "Timeline",           content: "1526–1857 CE. Founded by Babur after First Battle of Panipat (1526). Capital: Agra → Fatehpur Sikri → Delhi." },
  { id: "sn2",  topicId: "med-mughal",  title: "Six Emperors (BHAJI SABJI)", content: "Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb. Akbar: longest reign (49 yrs), greatest administrator." },
  { id: "sn3",  topicId: "med-mughal",  title: "Akbar's Legacy",     content: "Abolished jizya, introduced Din-i-Ilahi (1582), built Fatehpur Sikri, had nine Navratnas in court including Birbal & Todar Mal." },
  { id: "sn4",  topicId: "med-mughal",  title: "Shah Jahan",         content: "Built Taj Mahal (1632–48) in memory of Mumtaz Mahal, Red Fort, Jama Masjid. Deposed by son Aurangzeb in 1658." },
  { id: "sn5",  topicId: "med-mughal",  title: "Aurangzeb",          content: "Largest Mughal empire geographically. Reimposed jizya. Compiled Fatawa-e-Alamgiri. Died 1707 — decline began after him." },

  // Fundamental Rights
  { id: "sn6",  topicId: "fr-rights",   title: "6 Fundamental Rights (Art 12–35)", content: "1. Equality (14–18)  2. Freedom (19–22)  3. Against Exploitation (23–24)  4. Religion (25–28)  5. Cultural & Educational (29–30)  6. Constitutional Remedies (32)" },
  { id: "sn7",  topicId: "fr-rights",   title: "Right to Equality",  content: "Art 14: Equality before law. Art 15: No discrimination on race/religion/sex. Art 16: Equal employment opportunity. Art 17: Abolish untouchability. Art 18: Abolish titles." },
  { id: "sn8",  topicId: "fr-rights",   title: "Key Points",         content: "Originally 7 Rights — Right to Property removed by 44th Amendment (1978). Art 32 called 'soul of Constitution' by Ambedkar. All rights can be suspended during Emergency." },

  // Fundamental Duties
  { id: "sn9",  topicId: "fr-duties",   title: "Article 51A (11 Duties)", content: "Added by 42nd Amendment (1976). 11th duty added by 86th Amendment (2002): free compulsory education for children aged 6–14." },
  { id: "sn10", topicId: "fr-duties",   title: "Key Duties",         content: "Abide by Constitution · Cherish national movement · Uphold sovereignty · Protect environment · Develop scientific temper · Safeguard public property." },

  // DPSP
  { id: "sn11", topicId: "dpsp-art",    title: "DPSP Basics",        content: "Articles 36–51. Non-justiciable (not enforceable in courts). Inspired by Irish Constitution. Represent 'positive obligations' on the state." },
  { id: "sn12", topicId: "dpsp-art",    title: "Key DPSP Articles",  content: "Art 39: Equal pay, right to livelihood. Art 40: Village Panchayats. Art 44: Uniform Civil Code. Art 45: Free education (now Art 21A Right). Art 48: Cow protection." },

  // Solar System
  { id: "sn13", topicId: "ss-planets",  title: "8 Planets in Order", content: "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Mnemonic: My Very Educated Mother Just Served Us Noodles." },
  { id: "sn14", topicId: "ss-planets",  title: "Key Planet Facts",   content: "Largest: Jupiter. Smallest: Mercury. Hottest: Venus (greenhouse). Fastest orbit: Mercury (88 days). Rings: Saturn (prominent), Uranus, Neptune, Jupiter." },
  { id: "sn15", topicId: "ss-planets",  title: "Dwarf Planets",      content: "Pluto (reclassified 2006), Eris, Ceres, Makemake, Haumea. Pluto is in Kuiper Belt. IAU definition: orbits Sun, hydrostatic equilibrium, has NOT cleared its orbital neighbourhood." },

  // Trigonometry
  { id: "sn16", topicId: "trig",        title: "SOH-CAH-TOA",        content: "sin θ = Opposite/Hypotenuse · cos θ = Adjacent/Hypotenuse · tan θ = Opposite/Adjacent. Reciprocals: cosec, sec, cot." },
  { id: "sn17", topicId: "trig",        title: "Standard Values",    content: "sin 0°=0, 30°=½, 45°=1/√2, 60°=√3/2, 90°=1. Cos values are the reverse. tan 45°=1, tan 60°=√3, tan 90°=undefined." },
  { id: "sn18", topicId: "trig",        title: "Key Identities",     content: "sin²θ + cos²θ = 1 · 1 + tan²θ = sec²θ · 1 + cot²θ = cosec²θ · tan θ = sin θ / cos θ." },

  // Krebs Cycle
  { id: "sn19", topicId: "bio-resp",    title: "Location & Overview", content: "Occurs in mitochondrial matrix. 8 steps. Per turn: produces 3 NADH, 1 FADH₂, 1 GTP/ATP, 2 CO₂. Runs TWICE per glucose molecule." },
  { id: "sn20", topicId: "bio-resp",    title: "8 Intermediates",    content: "Citrate → Isocitrate → α-Ketoglutarate → Succinyl-CoA → Succinate → Fumarate → Malate → Oxaloacetate (regenerated). Mnemonic: Citric Krebs Sirf Sukoon Se Funky Music Online." },
  { id: "sn21", topicId: "bio-resp",    title: "Energy Accounting",  content: "Per glucose (2 cycles): 6 NADH, 2 FADH₂, 2 ATP. NADH → 2.5 ATP, FADH₂ → 1.5 ATP via oxidative phosphorylation." },

  // Mauryan Empire
  { id: "sn22", topicId: "anc-maurya", title: "Timeline & Capital",  content: "322–185 BCE. Founded by Chandragupta Maurya with Chanakya's help. Capital: Pataliputra (modern Patna, Bihar)." },
  { id: "sn23", topicId: "anc-maurya", title: "Rulers (CBAD)",       content: "Chandragupta → Bindusara → Ashoka → Dasharatha. Ashoka (268–232 BCE): converted to Buddhism after Kalinga War (261 BCE)." },
  { id: "sn24", topicId: "anc-maurya", title: "Ashoka's Legacy",     content: "Rock Edicts & Pillar Edicts spread Dhamma. Sent missions to Sri Lanka, Greece, Egypt. Built 84,000 stupas. Lion Capital (Sarnath) = India's national emblem." },

  // Delhi Sultanate
  { id: "sn25", topicId: "med-delhi",  title: "5 Dynasties",         content: "Slave (1206–90) → Khilji (1290–1320) → Tughlaq (1320–1414) → Sayyid (1414–51) → Lodi (1451–1526). All ruled from Delhi." },
  { id: "sn26", topicId: "med-delhi",  title: "Notable Rulers",      content: "Iltutmish: first to get Caliph's recognition. Raziya Sultan: first female ruler. Alauddin Khilji: market reforms. Firuz Shah: canal irrigation. Ibrahim Lodi: fell to Babur." },
  { id: "sn27", topicId: "med-delhi",  title: "End of Sultanate",    content: "Ibrahim Lodi defeated by Babur at First Battle of Panipat (1526) → Established Mughal Empire. Qutb Minar built by Qutb-ud-Din Aibak (1193), completed by Iltutmish." },

  // Indus Valley
  { id: "sn28", topicId: "anc-indus", title: "Overview",             content: "3300–1300 BCE (mature phase: 2600–1900 BCE). Also called Harappan Civilization. Bronze Age. Discovered: Harappa (1921) by Daya Ram Sahni." },
  { id: "sn29", topicId: "anc-indus", title: "Major Sites",          content: "Mohenjo-daro (Great Bath, Sindh) · Harappa (Punjab) · Kalibangan (fire altars, Rajasthan) · Lothal (dockyard, Gujarat) · Dholavira (Gujarat, UNESCO 2021)." },
  { id: "sn30", topicId: "anc-indus", title: "Key Features",         content: "Grid-pattern town planning · Advanced drainage system · Standardised weights & measures · Undeciphered Indus script (Boustrophedon style) · No iron or temples found." },

  // Vedic Period
  { id: "sn31", topicId: "anc-vedic", title: "Two Phases",           content: "Early Vedic (1500–1000 BCE): Rig-Vedic, tribal, cattle economy, no rigid caste. Later Vedic (1000–600 BCE): Jana Mahajanapadas, caste rigidity, agriculture expands." },
  { id: "sn32", topicId: "anc-vedic", title: "Four Vedas (RSYA)",    content: "Rigveda (hymns to gods) · Samaveda (melodies/chants) · Yajurveda (sacrificial rituals) · Atharvaveda (charms & spells). Rigveda is the oldest." },

  // Gupta Period
  { id: "sn33", topicId: "anc-gupta", title: "Golden Age of India",  content: "320–550 CE. Founded by Sri Gupta. Greatest under Chandragupta II (Vikramaditya). Known for art, science, literature and trade prosperity." },
  { id: "sn34", topicId: "anc-gupta", title: "Key Contributions",    content: "Aryabhata: zero, decimal system, π≈3.14, Earth rotates. Kalidasa: Shakuntala, Meghaduta. Varahamihira: astronomy. Charaka/Sushruta: medicine. University of Nalanda flourished." },
];
