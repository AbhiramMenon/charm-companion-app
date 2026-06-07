// DB-aligned types for admin app
// These mirror the Supabase schema (snake_case columns).

export type Difficulty    = 'Easy' | 'Medium' | 'Hard';
export type NewsTag       = 'Notification' | 'Admit Card' | 'Result' | 'Exam Date';
export type SubTier       = 'Free' | 'Exam Pack';
export type IssuePriority = 'low' | 'medium' | 'high';
export type IssueStatus   = 'open' | 'in_progress' | 'resolved';
export type NotiType      = 'streak' | 'goal' | 'achievement' | 'reminder' | 'tip' | 'exam_news';
export type NotiTarget    = 'all' | 'free' | 'subscribed';
export type NotiStatus    = 'draft' | 'scheduled' | 'sent';
export type BillCycle     = 'monthly' | 'sixmonths' | 'yearly';

export type Exam = {
  id: string;
  name: string;
  short: string;
  description: string | null;
  subjects_count: number;
  tricks_count: number;
  accent: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  name: string;
  icon: string | null;
  chapters_count: number;
  exam_id: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Chapter = {
  id: string;
  name: string;
  subject_id: string;
  tricks_count: number;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  name: string;
  chapter_id: string;
  tricks_count: number;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Trick = {
  id: string;
  title: string;
  content: string;
  explanation: string;
  difficulty: Difficulty;
  subject_tag: string | null;
  topic_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ShortNote = {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  is_custom: boolean;
  sort_order: number;
  created_at: string;
};

export type ExamNews = {
  id: string;
  exam_id: string;
  title: string;
  date_label: string | null;
  tag: NewsTag;
  accent: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExamPricing = {
  exam_id: string;
  monthly: number;
  sixmonths: number;
  yearly: number;
  updated_at: string;
};

export type TrickOfDay = {
  id: string;
  trick_id: string;
  date: string;
  note: string | null;
  created_at: string;
};

export type AppSettings = {
  id: 1;
  app_name: string;
  tagline: string;
  version: string;
  description: string | null;
  support_email: string | null;
  website_url: string | null;
  privacy_url: string | null;
  terms_url: string | null;
  play_store_url: string | null;
  app_store_url: string | null;
  team_members: { name: string; role: string }[];
  social_links: { platform: string; url: string }[];
  updated_at: string;
};

export type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  tier: SubTier;
  streak: number;
  tricks_learned: number;
  last_active_at: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  exam_id: string | null;
  plan_type: string;
  billing_cycle: BillCycle;
  amount_paise: number;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
};

export type TrickRating = {
  trick_id: string;
  avg_rating: number;
  total_ratings: number;
  star1: number;
  star2: number;
  star3: number;
  star4: number;
  star5: number;
  updated_at: string;
};

export type SupportIssue = {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: IssueStatus;
  priority: IssuePriority;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  updated_at: string;
};

export type PushNotification = {
  id: string;
  title: string;
  body: string;
  type: NotiType;
  target: NotiTarget;
  target_exam_id: string | null;
  scheduled_at: string;
  status: NotiStatus;
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
  updated_at: string;
};
