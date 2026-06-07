// ============================================================
// KrackIT — Shared Database Types
// These mirror the Supabase schema exactly.
// ============================================================

export type Difficulty    = 'Easy' | 'Medium' | 'Hard';
export type NewsTag       = 'Notification' | 'Admit Card' | 'Result' | 'Exam Date';
export type SubTier       = 'Free' | 'Exam Pack';
export type IssuePriority = 'low' | 'medium' | 'high';
export type IssueStatus   = 'open' | 'in_progress' | 'resolved';
export type NotiType      = 'streak' | 'goal' | 'achievement' | 'reminder' | 'tip' | 'exam_news';
export type NotiTarget    = 'all' | 'free' | 'subscribed';
export type NotiStatus    = 'draft' | 'scheduled' | 'sent';
export type BillCycle     = 'monthly' | 'sixmonths' | 'yearly';
export type PlanType      = 'exam_pack' | 'gold_learner' | 'pro';
export type SubStatus     = 'active' | 'cancelled' | 'expired';

// ─── Content ────────────────────────────────────────────────

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

// ─── User & Subscriptions ───────────────────────────────────

export type UserProfile = {
  id: string; // UUID
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
  id: string; // UUID
  user_id: string;
  exam_id: string | null;
  plan_type: PlanType;
  billing_cycle: BillCycle;
  amount_paise: number;
  status: SubStatus;
  started_at: string;
  expires_at: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  trick_id: string;
  mastered: boolean;
  viewed_at: string;
  mastered_at: string | null;
};

export type UserBookmark = {
  user_id: string;
  trick_id: string;
  created_at: string;
};

export type UserRating = {
  user_id: string;
  trick_id: string;
  stars: number;
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

// ─── Support & Notifications ────────────────────────────────

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

export type NotificationDelivery = {
  id: string;
  notification_id: string;
  user_id: string;
  read_at: string | null;
  created_at: string;
};

// ─── API Input Types (for create/update) ────────────────────

export type CreateExam    = Omit<Exam, 'id' | 'subjects_count' | 'tricks_count' | 'created_at' | 'updated_at'>;
export type UpdateExam    = Partial<CreateExam>;
export type CreateSubject = Omit<Subject, 'chapters_count' | 'created_at' | 'updated_at'>;
export type UpdateSubject = Partial<Omit<CreateSubject, 'id'>>;
export type CreateChapter = Omit<Chapter, 'tricks_count' | 'created_at' | 'updated_at'>;
export type UpdateChapter = Partial<Omit<CreateChapter, 'id'>>;
export type CreateTopic   = Omit<Topic, 'tricks_count' | 'created_at' | 'updated_at'>;
export type UpdateTopic   = Partial<Omit<CreateTopic, 'id'>>;
export type CreateTrick   = Omit<Trick, 'created_at' | 'updated_at'>;
export type UpdateTrick   = Partial<Omit<CreateTrick, 'id'>>;
export type CreateShortNote = Omit<ShortNote, 'created_at'>;
export type CreateExamNews  = Omit<ExamNews, 'created_at' | 'updated_at'>;
export type UpdateExamNews  = Partial<Omit<CreateExamNews, 'id'>>;
export type CreatePushNotification = Omit<PushNotification, 'id' | 'sent_at' | 'recipient_count' | 'created_at' | 'updated_at'>;
export type CreateSupportIssue     = Omit<SupportIssue, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSupportIssue     = Partial<Pick<SupportIssue, 'status' | 'priority' | 'admin_note' | 'resolved_at'>>;

// ─── Analytics ──────────────────────────────────────────────

export type ContentStats = {
  exams_count: number;
  subjects_count: number;
  chapters_count: number;
  topics_count: number;
  tricks_count: number;
  notes_count: number;
  news_count: number;
};

export type UserStats = {
  total_users: number;
  subscribed_users: number;
  free_users: number;
  active_subs: number;
  expiring_soon: number;
};

export type RevenueByExam = {
  exam_id: string;
  exam_name: string;
  subscriptions: number;
  total_paise: number;
  avg_paise: number;
};

// ─── Supabase Database schema type (for createClient<Database>()) ──────────

export type Database = {
  public: {
    Tables: {
      exams:                  { Row: Exam;               Insert: Partial<Exam>;             Update: Partial<Exam> };
      subjects:               { Row: Subject;            Insert: Partial<Subject>;          Update: Partial<Subject> };
      chapters:               { Row: Chapter;            Insert: Partial<Chapter>;          Update: Partial<Chapter> };
      topics:                 { Row: Topic;              Insert: Partial<Topic>;            Update: Partial<Topic> };
      tricks:                 { Row: Trick;              Insert: Partial<Trick>;            Update: Partial<Trick> };
      short_notes:            { Row: ShortNote;          Insert: Partial<ShortNote>;        Update: Partial<ShortNote> };
      exam_news:              { Row: ExamNews;           Insert: Partial<ExamNews>;         Update: Partial<ExamNews> };
      exam_pricing:           { Row: ExamPricing;        Insert: Partial<ExamPricing>;      Update: Partial<ExamPricing> };
      trick_of_day:           { Row: TrickOfDay;         Insert: Partial<TrickOfDay>;       Update: Partial<TrickOfDay> };
      trick_ratings:          { Row: TrickRating;        Insert: Partial<TrickRating>;      Update: Partial<TrickRating> };
      app_settings:           { Row: AppSettings;        Insert: Partial<AppSettings>;      Update: Partial<AppSettings> };
      user_profiles:          { Row: UserProfile;        Insert: Partial<UserProfile>;      Update: Partial<UserProfile> };
      subscriptions:          { Row: Subscription;       Insert: Partial<Subscription>;     Update: Partial<Subscription> };
      user_progress:          { Row: UserProgress;       Insert: Partial<UserProgress>;     Update: Partial<UserProgress> };
      user_bookmarks:         { Row: UserBookmark;       Insert: Partial<UserBookmark>;     Update: Partial<UserBookmark> };
      user_ratings:           { Row: UserRating;         Insert: Partial<UserRating>;       Update: Partial<UserRating> };
      support_issues:         { Row: SupportIssue;       Insert: Partial<SupportIssue>;     Update: Partial<SupportIssue> };
      push_notifications:     { Row: PushNotification;   Insert: Partial<PushNotification>; Update: Partial<PushNotification> };
      notification_deliveries:{ Row: NotificationDelivery; Insert: Partial<NotificationDelivery>; Update: Partial<NotificationDelivery> };
    };
    Views: {
      v_content_stats:  { Row: ContentStats };
      v_user_stats:     { Row: UserStats };
      v_revenue_by_exam:{ Row: RevenueByExam };
    };
    Functions: {
      is_admin:                    { Args: Record<string, never>; Returns: boolean };
      search_tricks:               { Args: { query: string; lim?: number }; Returns: (Trick & { rank: number })[] };
      get_user_subscribed_exams:   { Args: { p_user_id: string }; Returns: { exam_id: string }[] };
      expire_stale_subscriptions:  { Args: Record<string, never>; Returns: number };
      refresh_user_tier:           { Args: { p_user_id: string }; Returns: void };
    };
  };
};
