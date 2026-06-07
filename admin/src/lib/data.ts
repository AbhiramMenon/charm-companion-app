// ─── Types ───────────────────────────────────────────────────────────────────

export type Difficulty  = "Easy" | "Medium" | "Hard";
export type NewsTag     = "Notification" | "Admit Card" | "Result" | "Exam Date";
export type SubTier     = "Free" | "Exam Pack";
export type IssuePriority = "low" | "medium" | "high";
export type IssueStatus   = "open" | "in_progress" | "resolved";
export type NotiType    = "streak" | "goal" | "achievement" | "reminder" | "tip" | "exam_news";
export type NotiTarget  = "all" | "free" | "subscribed";
export type BillCycle   = "monthly" | "sixmonths" | "yearly";

export type Exam = {
  id: string; name: string; short: string; description: string;
  subjects: number; tricks: number; accent: string;
};
export type Subject = {
  id: string; name: string; icon: string; chapters: number;
  examId: string; color: string;
};
export type Chapter = {
  id: string; name: string; subjectId: string; tricksCount: number;
  progress: number; icon?: string;
};
export type Topic = {
  id: string; name: string; chapterId: string; tricksCount: number; icon?: string;
};
export type Trick = {
  id: string; title: string; content: string; explanation: string;
  difficulty: Difficulty; subject: string; topic: string;
};
export type ShortNote = {
  id: string; topicId: string; title: string; content: string; isCustom?: boolean;
};
export type ExamNews = {
  id: string; exam: string; title: string; date: string; tag: NewsTag; accent: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  tier: SubTier;
  subscribedExams: string[];
  subscriptionExpiry?: string;
  billingCycle?: BillCycle;
  lastActiveAt: string;
  tricksLearned: number;
  streak: number;
};

export type TrickRating = {
  trickId: string;
  avgRating: number;
  totalRatings: number;
  dist: [number, number, number, number, number];
};

export type SupportIssue = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: IssueStatus;
  priority: IssuePriority;
  createdAt: string;
  resolvedAt?: string;
};

export type AdminNotification = {
  id: string;
  title: string;
  body: string;
  type: NotiType;
  target: NotiTarget;
  targetExamId?: string;
  scheduledAt: string;
  status: "draft" | "scheduled" | "sent";
};

export type TrickOfDay = {
  id: string;
  trickId: string;
  date: string;
  note?: string;
};

export type ExamPricing = {
  examId: string;
  monthly: number;
  sixmonths: number;
  yearly: number;
};

export type AppAbout = {
  appName: string;
  tagline: string;
  version: string;
  description: string;
  supportEmail: string;
  websiteUrl: string;
  privacyUrl: string;
  termsUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  teamMembers: { name: string; role: string }[];
  socialLinks: { platform: string; url: string }[];
};

export type Store = {
  exams: Exam[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  tricks: Trick[];
  notes: ShortNote[];
  news: ExamNews[];
  users: AppUser[];
  ratings: TrickRating[];
  issues: SupportIssue[];
  notifications: AdminNotification[];
  trickOfDay: TrickOfDay[];
  pricing: ExamPricing[];
  about: AppAbout;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Store = {
  exams: [
    { id: "upsc",  name: "UPSC CSE",  short: "UPSC",  description: "Civil Services Examination",  subjects: 6, tricks: 480, accent: "from-amber-400/30 to-amber-700/10"   },
    { id: "ssc",   name: "SSC CGL",   short: "SSC",   description: "Staff Selection Commission",   subjects: 6, tricks: 320, accent: "from-rose-400/30 to-rose-700/10"    },
    { id: "neet",  name: "NEET UG",   short: "NEET",  description: "Medical Entrance Exam",        subjects: 6, tricks: 540, accent: "from-emerald-400/30 to-emerald-700/10" },
    { id: "jee",   name: "JEE Main",  short: "JEE",   description: "Engineering Entrance",         subjects: 6, tricks: 610, accent: "from-sky-400/30 to-sky-700/10"       },
    { id: "cat",   name: "CAT",       short: "CAT",   description: "MBA Entrance Exam",            subjects: 4, tricks: 220, accent: "from-violet-400/30 to-violet-700/10" },
    { id: "bank",  name: "Banking",   short: "IBPS",  description: "PO, Clerk & RRB",             subjects: 6, tricks: 380, accent: "from-cyan-400/30 to-cyan-700/10"     },
  ],
  subjects: [
    { id: "history", name: "History",         icon: "📜", chapters: 4,  examId: "upsc", color: "from-amber-500/25 to-amber-900/5"     },
    { id: "polity",  name: "Polity",           icon: "⚖️", chapters: 4,  examId: "upsc", color: "from-rose-500/25 to-rose-900/5"      },
    { id: "geo",     name: "Geography",        icon: "🌍", chapters: 3,  examId: "upsc", color: "from-emerald-500/25 to-emerald-900/5" },
    { id: "eco",     name: "Economy",          icon: "📈", chapters: 16, examId: "upsc", color: "from-sky-500/25 to-sky-900/5"        },
    { id: "sci",     name: "Science & Tech",   icon: "🧪", chapters: 20, examId: "upsc", color: "from-violet-500/25 to-violet-900/5"  },
    { id: "env",     name: "Environment",      icon: "🌱", chapters: 10, examId: "upsc", color: "from-cyan-500/25 to-cyan-900/5"      },
    { id: "qa",      name: "Quant Aptitude",   icon: "🔢", chapters: 3,  examId: "ssc",  color: "from-amber-500/25 to-amber-900/5"    },
    { id: "rea",     name: "Reasoning",        icon: "🧩", chapters: 14, examId: "ssc",  color: "from-rose-500/25 to-rose-900/5"     },
    { id: "eng",     name: "English",          icon: "🔤", chapters: 12, examId: "ssc",  color: "from-sky-500/25 to-sky-900/5"       },
    { id: "ga",      name: "General Awareness",icon: "🌐", chapters: 16, examId: "ssc",  color: "from-emerald-500/25 to-emerald-900/5" },
    { id: "phy",     name: "Physics",          icon: "⚛️", chapters: 20, examId: "neet", color: "from-sky-500/25 to-sky-900/5"        },
    { id: "chem",    name: "Chemistry",        icon: "⚗️", chapters: 22, examId: "neet", color: "from-emerald-500/25 to-emerald-900/5" },
    { id: "bio",     name: "Biology",          icon: "🧬", chapters: 3,  examId: "neet", color: "from-rose-500/25 to-rose-900/5"     },
  ],
  chapters: [
    { id: "anc",         name: "Ancient India",        subjectId: "history",  tricksCount: 4,  progress: 0, icon: "🏺" },
    { id: "med",         name: "Medieval India",        subjectId: "history",  tricksCount: 3,  progress: 0, icon: "🏰" },
    { id: "mod",         name: "Modern India",          subjectId: "history",  tricksCount: 8,  progress: 0, icon: "✊" },
    { id: "world",       name: "World History",         subjectId: "history",  tricksCount: 6,  progress: 0, icon: "🌍" },
    { id: "fr",          name: "Fundamental Rights",    subjectId: "polity",   tricksCount: 3,  progress: 0, icon: "⚖️" },
    { id: "dpsp",        name: "DPSP",                  subjectId: "polity",   tricksCount: 4,  progress: 0, icon: "📜" },
    { id: "parl",        name: "Parliament",            subjectId: "polity",   tricksCount: 5,  progress: 0, icon: "🏛️" },
    { id: "jud",         name: "Judiciary",             subjectId: "polity",   tricksCount: 4,  progress: 0, icon: "👨‍⚖️" },
    { id: "phys",        name: "Physical Geography",    subjectId: "geo",      tricksCount: 6,  progress: 0, icon: "🗺️" },
    { id: "ind",         name: "Indian Geography",      subjectId: "geo",      tricksCount: 5,  progress: 0, icon: "🇮🇳" },
    { id: "ss",          name: "Solar System",          subjectId: "geo",      tricksCount: 3,  progress: 0, icon: "🌌" },
    { id: "trig-ch",     name: "Trigonometry",          subjectId: "qa",       tricksCount: 4,  progress: 0, icon: "📐" },
    { id: "alg-ch",      name: "Algebra",               subjectId: "qa",       tricksCount: 5,  progress: 0, icon: "✏️" },
    { id: "arith-ch",    name: "Arithmetic",            subjectId: "qa",       tricksCount: 6,  progress: 0, icon: "🔢" },
    { id: "cell-ch",     name: "Cell Biology",          subjectId: "bio",      tricksCount: 5,  progress: 0, icon: "🧫" },
    { id: "bio-resp-ch", name: "Cellular Respiration",  subjectId: "bio",      tricksCount: 4,  progress: 0, icon: "⚡" },
    { id: "genetics-ch", name: "Genetics",              subjectId: "bio",      tricksCount: 6,  progress: 0, icon: "🧬" },
  ],
  topics: [
    { id: "anc-indus",      name: "Indus Valley Civilization", chapterId: "anc",         tricksCount: 1 },
    { id: "anc-vedic",      name: "Vedic Period",              chapterId: "anc",         tricksCount: 1 },
    { id: "anc-maurya",     name: "Mauryan Empire",            chapterId: "anc",         tricksCount: 1 },
    { id: "anc-gupta",      name: "Gupta Period",              chapterId: "anc",         tricksCount: 1 },
    { id: "med-delhi",      name: "Delhi Sultanate",           chapterId: "med",         tricksCount: 1 },
    { id: "med-mughal",     name: "Mughal Empire",             chapterId: "med",         tricksCount: 1 },
    { id: "med-south",      name: "South Indian Kingdoms",     chapterId: "med",         tricksCount: 1 },
    { id: "mod-revolt",     name: "1857 Revolt",               chapterId: "mod",         tricksCount: 2 },
    { id: "mod-movements",  name: "Freedom Movements",         chapterId: "mod",         tricksCount: 2 },
    { id: "mod-leaders",    name: "National Leaders",          chapterId: "mod",         tricksCount: 2 },
    { id: "mod-acts",       name: "Important Acts",            chapterId: "mod",         tricksCount: 2 },
    { id: "wh-wars",        name: "World Wars",                chapterId: "world",       tricksCount: 2 },
    { id: "wh-revolutions", name: "Revolutions",               chapterId: "world",       tricksCount: 2 },
    { id: "wh-orgs",        name: "International Orgs",        chapterId: "world",       tricksCount: 2 },
    { id: "fr-rights",      name: "6 Fundamental Rights",      chapterId: "fr",          tricksCount: 1 },
    { id: "fr-duties",      name: "Fundamental Duties",        chapterId: "fr",          tricksCount: 1 },
    { id: "fr-amend",       name: "Key Amendments",            chapterId: "fr",          tricksCount: 1 },
    { id: "dpsp-art",       name: "DPSP Articles",             chapterId: "dpsp",        tricksCount: 2 },
    { id: "dpsp-types",     name: "Types of Directives",       chapterId: "dpsp",        tricksCount: 2 },
    { id: "parl-lok",       name: "Lok Sabha",                 chapterId: "parl",        tricksCount: 2 },
    { id: "parl-rajya",     name: "Rajya Sabha",               chapterId: "parl",        tricksCount: 2 },
    { id: "parl-sessions",  name: "Parliamentary Sessions",    chapterId: "parl",        tricksCount: 1 },
    { id: "jud-sc",         name: "Supreme Court",             chapterId: "jud",         tricksCount: 2 },
    { id: "jud-hc",         name: "High Courts",               chapterId: "jud",         tricksCount: 2 },
    { id: "ss-planets",     name: "Planets & Order",           chapterId: "ss",          tricksCount: 1 },
    { id: "ss-moon",        name: "Moon & Satellites",         chapterId: "ss",          tricksCount: 1 },
    { id: "ss-misc",        name: "Stars & Phenomena",         chapterId: "ss",          tricksCount: 1 },
    { id: "trig",           name: "Trig Ratios (SOH-CAH-TOA)", chapterId: "trig-ch",     tricksCount: 1 },
    { id: "trig-ids",       name: "Trig Identities",           chapterId: "trig-ch",     tricksCount: 2 },
    { id: "trig-graphs",    name: "Trig Graphs",               chapterId: "trig-ch",     tricksCount: 1 },
    { id: "bio-resp",       name: "Krebs Cycle",               chapterId: "bio-resp-ch", tricksCount: 1 },
    { id: "bio-glyco",      name: "Glycolysis",                chapterId: "bio-resp-ch", tricksCount: 2 },
    { id: "bio-atp",        name: "ATP Synthesis",             chapterId: "bio-resp-ch", tricksCount: 1 },
  ],
  tricks: [
    { id: "t1", title: "Remember Mughal Emperors in Order",      content: "BHAJI SABJI FAM",    explanation: "Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb. A spicy mnemonic that sticks.",  difficulty: "Easy",   subject: "History", topic: "med-mughal" },
    { id: "t2", title: "Fundamental Rights — Indian Constitution", content: "RECREE — 6 Rights", explanation: "Right to Equality, Right against Exploitation, Cultural & Educational, Religion, Equality before law, Education.", difficulty: "Medium", subject: "Polity",  topic: "fr-rights"  },
    { id: "t3", title: "Trigonometric Identities (SOH-CAH-TOA)",  content: "SOH-CAH-TOA",        explanation: "Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent.",               difficulty: "Easy",   subject: "Maths",   topic: "trig"       },
  ],
  notes: [],
  news: [
    { id: "n1", exam: "UPSC",  title: "CSE Prelims 2026 notification released",  date: "Feb 14", tag: "Notification", accent: "from-amber-500/30 to-amber-900/10"    },
    { id: "n2", exam: "NEET",  title: "NEET UG admit cards out next week",        date: "Apr 28", tag: "Admit Card",   accent: "from-emerald-500/30 to-emerald-900/10" },
    { id: "n3", exam: "SSC",   title: "CGL Tier 1 exam dates announced",          date: "Jun 09", tag: "Exam Date",    accent: "from-rose-500/30 to-rose-900/10"       },
    { id: "n4", exam: "JEE",   title: "JEE Main Session 2 results declared",      date: "May 02", tag: "Result",       accent: "from-sky-500/30 to-sky-900/10"         },
    { id: "n5", exam: "IBPS",  title: "PO 2026 prelims notification live",        date: "Jul 18", tag: "Notification", accent: "from-cyan-500/30 to-cyan-900/10"       },
  ],
  users: [
    { id: "u01", name: "Arjun Sharma",    email: "arjun.sharma@gmail.com",    phone: "+91-9876543210", joinedAt: "2025-11-03", tier: "Exam Pack", subscribedExams: ["upsc"],        subscriptionExpiry: "2026-11-03", billingCycle: "yearly",    lastActiveAt: "2026-06-06", tricksLearned: 142, streak: 21 },
    { id: "u02", name: "Priya Nair",      email: "priya.nair@gmail.com",      phone: "+91-9876543211", joinedAt: "2026-01-15", tier: "Exam Pack", subscribedExams: ["neet"],        subscriptionExpiry: "2026-07-15", billingCycle: "sixmonths", lastActiveAt: "2026-06-07", tricksLearned:  98, streak: 14 },
    { id: "u03", name: "Rahul Gupta",     email: "rahul.gupta@gmail.com",     phone: "+91-9876543212", joinedAt: "2025-09-20", tier: "Exam Pack", subscribedExams: ["upsc", "ssc"], subscriptionExpiry: "2026-06-15", billingCycle: "monthly",   lastActiveAt: "2026-06-05", tricksLearned: 210, streak:  7 },
    { id: "u04", name: "Sneha Patel",     email: "sneha.patel@gmail.com",     phone: "+91-9876543213", joinedAt: "2026-03-01", tier: "Free",      subscribedExams: [],              lastActiveAt: "2026-06-07", tricksLearned:  18, streak:  3 },
    { id: "u05", name: "Vikram Singh",    email: "vikram.singh@gmail.com",    phone: "+91-9876543214", joinedAt: "2025-12-10", tier: "Exam Pack", subscribedExams: ["jee"],         subscriptionExpiry: "2026-06-20", billingCycle: "sixmonths", lastActiveAt: "2026-06-04", tricksLearned: 175, streak: 45 },
    { id: "u06", name: "Anjali Verma",    email: "anjali.verma@gmail.com",    phone: "+91-9876543215", joinedAt: "2026-02-14", tier: "Free",      subscribedExams: [],              lastActiveAt: "2026-06-01", tricksLearned:   5, streak:  0 },
    { id: "u07", name: "Deepak Kumar",    email: "deepak.kumar@gmail.com",    phone: "+91-9876543216", joinedAt: "2025-08-05", tier: "Exam Pack", subscribedExams: ["upsc"],        subscriptionExpiry: "2026-08-05", billingCycle: "yearly",    lastActiveAt: "2026-06-07", tricksLearned: 320, streak: 62 },
    { id: "u08", name: "Meena Iyer",      email: "meena.iyer@gmail.com",      phone: "+91-9876543217", joinedAt: "2026-04-22", tier: "Exam Pack", subscribedExams: ["bank"],        subscriptionExpiry: "2026-06-18", billingCycle: "monthly",   lastActiveAt: "2026-06-06", tricksLearned:  44, streak:  8 },
    { id: "u09", name: "Suresh Reddy",    email: "suresh.reddy@gmail.com",    phone: "+91-9876543218", joinedAt: "2025-10-30", tier: "Free",      subscribedExams: [],              lastActiveAt: "2026-05-28", tricksLearned:  12, streak:  0 },
    { id: "u10", name: "Kavita Joshi",    email: "kavita.joshi@gmail.com",    phone: "+91-9876543219", joinedAt: "2026-01-01", tier: "Exam Pack", subscribedExams: ["cat"],         subscriptionExpiry: "2027-01-01", billingCycle: "yearly",    lastActiveAt: "2026-06-07", tricksLearned:  87, streak: 19 },
    { id: "u11", name: "Amit Tiwari",     email: "amit.tiwari@gmail.com",     phone: "+91-9877543210", joinedAt: "2026-05-01", tier: "Free",      subscribedExams: [],              lastActiveAt: "2026-06-06", tricksLearned:   3, streak:  2 },
    { id: "u12", name: "Pooja Mishra",    email: "pooja.mishra@gmail.com",    phone: "+91-9877543211", joinedAt: "2025-07-15", tier: "Exam Pack", subscribedExams: ["neet", "jee"], subscriptionExpiry: "2026-07-15", billingCycle: "yearly",    lastActiveAt: "2026-06-07", tricksLearned: 290, streak: 33 },
    { id: "u13", name: "Rajan Pillai",    email: "rajan.pillai@gmail.com",    phone: "+91-9877543212", joinedAt: "2026-03-20", tier: "Exam Pack", subscribedExams: ["ssc"],         subscriptionExpiry: "2026-06-25", billingCycle: "monthly",   lastActiveAt: "2026-06-05", tricksLearned:  56, streak: 11 },
    { id: "u14", name: "Neha Saxena",     email: "neha.saxena@gmail.com",     phone: "+91-9877543213", joinedAt: "2026-04-05", tier: "Free",      subscribedExams: [],              lastActiveAt: "2026-06-07", tricksLearned:   9, streak:  1 },
    { id: "u15", name: "Kiran Bhat",      email: "kiran.bhat@gmail.com",      phone: "+91-9877543214", joinedAt: "2025-11-20", tier: "Exam Pack", subscribedExams: ["upsc"],        subscriptionExpiry: "2026-06-12", billingCycle: "sixmonths", lastActiveAt: "2026-06-06", tricksLearned: 198, streak: 27 },
    { id: "u16", name: "Lakshmi Rao",     email: "lakshmi.rao@gmail.com",     phone: "+91-9877543215", joinedAt: "2026-02-28", tier: "Exam Pack", subscribedExams: ["bank"],        subscriptionExpiry: "2026-08-28", billingCycle: "sixmonths", lastActiveAt: "2026-06-03", tricksLearned:  71, streak:  5 },
    { id: "u17", name: "Manish Yadav",    email: "manish.yadav@gmail.com",    phone: "+91-9877543216", joinedAt: "2026-01-10", tier: "Free",      subscribedExams: [],              lastActiveAt: "2026-05-15", tricksLearned:   0, streak:  0 },
    { id: "u18", name: "Sunita Devi",     email: "sunita.devi@gmail.com",     phone: "+91-9877543217", joinedAt: "2025-09-01", tier: "Exam Pack", subscribedExams: ["upsc", "geo"], subscriptionExpiry: "2026-09-01", billingCycle: "yearly",    lastActiveAt: "2026-06-07", tricksLearned: 445, streak: 88 },
    { id: "u19", name: "Rohit Jain",      email: "rohit.jain@gmail.com",      phone: "+91-9877543218", joinedAt: "2026-05-15", tier: "Exam Pack", subscribedExams: ["jee"],         subscriptionExpiry: "2026-06-14", billingCycle: "monthly",   lastActiveAt: "2026-06-07", tricksLearned:  22, streak:  4 },
    { id: "u20", name: "Divya Menon",     email: "divya.menon@gmail.com",     phone: "+91-9877543219", joinedAt: "2026-03-08", tier: "Free",      subscribedExams: [],              lastActiveAt: "2026-06-07", tricksLearned:  31, streak:  6 },
  ],
  ratings: [
    { trickId: "t1", avgRating: 4.6, totalRatings: 1247, dist: [12, 31, 78, 298, 828] },
    { trickId: "t2", avgRating: 4.2, totalRatings:  893, dist: [18, 44, 112, 312, 407] },
    { trickId: "t3", avgRating: 4.8, totalRatings: 2104, dist: [8,  19,  47, 189, 1841] },
  ],
  issues: [
    { id: "i1", userId: "u04", userName: "Sneha Patel",  userEmail: "sneha.patel@gmail.com",  subject: "App crashes on trick detail",      message: "Whenever I open a trick and try to swipe back, the app crashes. Running Android 13.", status: "open",        priority: "high",   createdAt: "2026-06-05" },
    { id: "i2", userId: "u09", userName: "Suresh Reddy", userEmail: "suresh.reddy@gmail.com", subject: "Payment not reflecting",           message: "I paid for UPSC pack 3 days ago but subscription still shows Free tier.", status: "in_progress", priority: "high",   createdAt: "2026-06-03" },
    { id: "i3", userId: "u06", userName: "Anjali Verma", userEmail: "anjali.verma@gmail.com", subject: "Streak reset unexpectedly",        message: "My streak was 15 days but reset to 0 after the app update.", status: "open",        priority: "medium", createdAt: "2026-06-04" },
    { id: "i4", userId: "u11", userName: "Amit Tiwari",  userEmail: "amit.tiwari@gmail.com",  subject: "Suggest more UPSC Polity tricks",  message: "Could you add more tricks for DPSP and Fundamental Duties? The existing ones are great!", status: "resolved",    priority: "low",    createdAt: "2026-05-28", resolvedAt: "2026-06-01" },
    { id: "i5", userId: "u17", userName: "Manish Yadav", userEmail: "manish.yadav@gmail.com", subject: "Profile picture not saving",       message: "Every time I upload a profile picture and close the app, it disappears.", status: "in_progress", priority: "medium", createdAt: "2026-06-02" },
  ],
  notifications: [
    { id: "no1", title: "Maintain your streak!",          body: "Don't break your study streak. Open the app and learn one trick today.",         type: "streak",    target: "all",        scheduledAt: "2026-06-07T08:00:00", status: "sent"      },
    { id: "no2", title: "UPSC Prelims in 45 days!",       body: "Time is ticking. Review your weak areas in History and Polity.",                type: "reminder",  target: "subscribed", targetExamId: "upsc", scheduledAt: "2026-06-06T09:00:00", status: "sent"      },
    { id: "no3", title: "New tricks added!",              body: "10 new tricks for Biology – Krebs Cycle added. Check them out.",                 type: "tip",       target: "all",        scheduledAt: "2026-06-08T10:00:00", status: "scheduled" },
    { id: "no4", title: "You're on a roll!",              body: "You've completed 50 tricks this week. Keep the momentum going!",                 type: "achievement",target: "all",        scheduledAt: "2026-06-07T18:00:00", status: "sent"      },
    { id: "no5", title: "Weekend revision tip",           body: "Spend 20 minutes on SOH-CAH-TOA identities. Quick revision before Monday.",     type: "tip",       target: "all",        scheduledAt: "2026-06-09T07:00:00", status: "draft"     },
  ],
  trickOfDay: [
    { id: "tod1", trickId: "t1", date: "2026-06-07", note: "Great for UPSC History prep" },
    { id: "tod2", trickId: "t3", date: "2026-06-08", note: "Math basics for all exams"   },
    { id: "tod3", trickId: "t2", date: "2026-06-09", note: "Polity fundamentals"         },
  ],
  pricing: [
    { examId: "upsc", monthly: 199, sixmonths: 999,  yearly: 1699 },
    { examId: "ssc",  monthly: 149, sixmonths: 749,  yearly: 1299 },
    { examId: "neet", monthly: 249, sixmonths: 1299, yearly: 2199 },
    { examId: "jee",  monthly: 249, sixmonths: 1299, yearly: 2199 },
    { examId: "cat",  monthly: 179, sixmonths: 899,  yearly: 1499 },
    { examId: "bank", monthly: 129, sixmonths: 649,  yearly: 1099 },
  ],
  about: {
    appName: "KrackIT",
    tagline: "One trick ahead",
    version: "2.1.0",
    description: "KrackIT is India's smartest exam-prep app. We help aspirants crack competitive exams using powerful memory tricks, mnemonics, and bite-sized learning. Our mission is to make quality exam prep accessible to every student.",
    supportEmail: "support@krackit.app",
    websiteUrl: "https://krackit.app",
    privacyUrl: "https://krackit.app/privacy",
    termsUrl: "https://krackit.app/terms",
    playStoreUrl: "https://play.google.com/store/apps/details?id=app.krackit",
    appStoreUrl: "https://apps.apple.com/app/krackit/id000000000",
    teamMembers: [
      { name: "Rahul Mehta",   role: "Founder & CEO"        },
      { name: "Priya Singh",   role: "Head of Content"      },
      { name: "Ankit Sharma",  role: "Lead Developer"       },
      { name: "Kavya Reddy",   role: "Product Designer"     },
    ],
    socialLinks: [
      { platform: "Twitter",   url: "https://twitter.com/krackitapp"   },
      { platform: "Instagram", url: "https://instagram.com/krackitapp" },
      { platform: "YouTube",   url: "https://youtube.com/@krackitapp"  },
      { platform: "LinkedIn",  url: "https://linkedin.com/company/krackit" },
    ],
  },
};

// ─── localStorage persistence ─────────────────────────────────────────────────

const LS_KEY = "krackit_admin_store";

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Store>;
      // Merge new collections that may not exist in older saved stores
      return {
        ...SEED,
        ...parsed,
        users:         parsed.users         ?? SEED.users,
        ratings:       parsed.ratings       ?? SEED.ratings,
        issues:        parsed.issues        ?? SEED.issues,
        notifications: parsed.notifications ?? SEED.notifications,
        trickOfDay:    parsed.trickOfDay    ?? SEED.trickOfDay,
        pricing:       parsed.pricing       ?? SEED.pricing,
        about:         parsed.about         ?? SEED.about,
      };
    }
  } catch { /* ignore */ }
  return structuredClone(SEED);
}

export function saveStore(store: Store): void {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

export function resetStore(): Store {
  const fresh = structuredClone(SEED);
  saveStore(fresh);
  return fresh;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Supabase integration helpers ────────────────────────────────────────────

import type {
  Exam as DbExam, Subject as DbSubject, Chapter as DbChapter,
  Topic as DbTopic, Trick as DbTrick, ShortNote as DbNote,
  ExamNews as DbNews, ExamPricing as DbPricing, TrickOfDay as DbTod,
  AppSettings, TrickRating as DbRating, SupportIssue as DbIssue,
  PushNotification as DbNoti, UserProfile as DbProfile,
} from './adminApiTypes';

type AdminData = {
  exams: DbExam[]; subjects: DbSubject[]; chapters: DbChapter[];
  topics: DbTopic[]; tricks: DbTrick[]; notes: DbNote[]; news: DbNews[];
  users: DbProfile[]; ratings: DbRating[]; issues: DbIssue[];
  notifications: DbNoti[]; trickOfDay: DbTod[]; pricing: DbPricing[];
  about: AppSettings;
};

export function emptyStore(): Store {
  return {
    exams: [], subjects: [], chapters: [], topics: [],
    tricks: [], notes: [], news: [],
    users: [], ratings: [], issues: [], notifications: [],
    trickOfDay: [], pricing: [],
    about: {
      appName: 'KrackIT', tagline: '', version: '1.0.0', description: '',
      supportEmail: '', websiteUrl: '', privacyUrl: '', termsUrl: '',
      playStoreUrl: '', appStoreUrl: '', teamMembers: [], socialLinks: [],
    },
  };
}

export function mapDbToStore(d: AdminData): Store {
  return {
    exams: d.exams.map(e => {
      const subjectIds  = d.subjects.filter(s => s.exam_id === e.id).map(s => s.id);
      const chapterIds  = d.chapters.filter(c => subjectIds.includes(c.subject_id)).map(c => c.id);
      const topicIds    = d.topics.filter(t => chapterIds.includes(t.chapter_id)).map(t => t.id);
      return {
        id: e.id, name: e.name, short: e.short,
        description: e.description ?? '',
        subjects: subjectIds.length,
        tricks:   d.tricks.filter(tr => topicIds.includes(tr.topic_id)).length,
        accent: e.accent ?? '',
      };
    }),
    subjects: d.subjects.map(s => ({
      id: s.id, name: s.name, icon: s.icon ?? '',
      chapters: d.chapters.filter(c => c.subject_id === s.id).length,
      examId: s.exam_id, color: s.color ?? '',
    })),
    chapters: d.chapters.map(c => {
      const topicIds = d.topics.filter(t => t.chapter_id === c.id).map(t => t.id);
      return {
        id: c.id, name: c.name, subjectId: c.subject_id,
        tricksCount: d.tricks.filter(tr => topicIds.includes(tr.topic_id)).length,
        progress: 0, icon: c.icon ?? undefined,
      };
    }),
    topics: d.topics.map(t => ({
      id: t.id, name: t.name, chapterId: t.chapter_id,
      tricksCount: d.tricks.filter(tr => tr.topic_id === t.id).length,
      icon: t.icon ?? undefined,
    })),
    tricks: d.tricks.map(t => ({
      id: t.id, title: t.title, content: t.content, explanation: t.explanation,
      difficulty: t.difficulty, subject: t.subject_tag ?? '', topic: t.topic_id,
    })),
    notes: d.notes.map(n => ({
      id: n.id, topicId: n.topic_id, title: n.title,
      content: n.content, isCustom: n.is_custom,
    })),
    news: d.news.map(n => ({
      id: n.id, exam: n.exam_id, title: n.title,
      date: n.date_label ?? '', tag: n.tag, accent: n.accent ?? '',
    })),
    users: d.users.map(u => ({
      id: u.id, name: u.name ?? '', email: '', phone: u.phone ?? '',
      joinedAt: u.created_at, tier: u.tier, subscribedExams: [],
      lastActiveAt: u.last_active_at, tricksLearned: u.tricks_learned, streak: u.streak,
    })),
    ratings: d.ratings.map(r => ({
      trickId: r.trick_id, avgRating: r.avg_rating, totalRatings: r.total_ratings,
      dist: [r.star1, r.star2, r.star3, r.star4, r.star5],
    })),
    issues: d.issues.map(i => ({
      id: i.id, userId: i.user_id ?? '', userName: i.user_name,
      userEmail: i.user_email, subject: i.subject, message: i.message,
      status: i.status, priority: i.priority,
      createdAt: i.created_at, resolvedAt: i.resolved_at ?? undefined,
    })),
    notifications: d.notifications.map(n => ({
      id: n.id, title: n.title, body: n.body, type: n.type, target: n.target,
      targetExamId: n.target_exam_id ?? undefined,
      scheduledAt: n.scheduled_at ?? '', status: n.status,
    })),
    trickOfDay: d.trickOfDay.map(t => ({
      id: t.id, trickId: t.trick_id, date: t.date, note: t.note ?? undefined,
    })),
    pricing: d.pricing.map(p => ({
      examId: p.exam_id, monthly: p.monthly, sixmonths: p.sixmonths, yearly: p.yearly,
    })),
    about: {
      appName: d.about.app_name, tagline: d.about.tagline, version: d.about.version,
      description: d.about.description ?? '', supportEmail: d.about.support_email ?? '',
      websiteUrl: d.about.website_url ?? '', privacyUrl: d.about.privacy_url ?? '',
      termsUrl: d.about.terms_url ?? '', playStoreUrl: d.about.play_store_url ?? '',
      appStoreUrl: d.about.app_store_url ?? '',
      teamMembers: d.about.team_members ?? [], socialLinks: d.about.social_links ?? [],
    },
  };
}
