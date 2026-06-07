-- ============================================================
-- KrackIT Database Schema
-- Migration 001 — Initial Schema
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================
-- HELPER: auto-update updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- CONTENT HIERARCHY
-- exams → subjects → chapters → topics → tricks
-- ============================================================

CREATE TABLE exams (
  id           TEXT        PRIMARY KEY,
  name         TEXT        NOT NULL,
  short        TEXT        NOT NULL CHECK (length(short) <= 8),
  description  TEXT,
  subjects_count INTEGER   NOT NULL DEFAULT 0,
  tricks_count   INTEGER   NOT NULL DEFAULT 0,
  accent       TEXT        NOT NULL DEFAULT '',
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER exams_updated_at BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE subjects (
  id             TEXT        PRIMARY KEY,
  name           TEXT        NOT NULL,
  icon           TEXT,
  chapters_count INTEGER     NOT NULL DEFAULT 0,
  exam_id        TEXT        NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  color          TEXT        NOT NULL DEFAULT '',
  sort_order     INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX subjects_exam_id_idx ON subjects(exam_id);
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE chapters (
  id           TEXT        PRIMARY KEY,
  name         TEXT        NOT NULL,
  subject_id   TEXT        NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  tricks_count INTEGER     NOT NULL DEFAULT 0,
  icon         TEXT,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX chapters_subject_id_idx ON chapters(subject_id);
CREATE TRIGGER chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE topics (
  id           TEXT        PRIMARY KEY,
  name         TEXT        NOT NULL,
  chapter_id   TEXT        NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  tricks_count INTEGER     NOT NULL DEFAULT 0,
  icon         TEXT,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX topics_chapter_id_idx ON topics(chapter_id);
CREATE TRIGGER topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE tricks (
  id          TEXT        PRIMARY KEY,
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  explanation TEXT        NOT NULL,
  difficulty  TEXT        NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  subject_tag TEXT,
  topic_id    TEXT        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX tricks_topic_id_idx ON tricks(topic_id);
CREATE INDEX tricks_difficulty_idx ON tricks(difficulty);
CREATE INDEX tricks_title_fts_idx ON tricks USING gin(to_tsvector('english', title || ' ' || content));
CREATE TRIGGER tricks_updated_at BEFORE UPDATE ON tricks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE short_notes (
  id         TEXT        PRIMARY KEY,
  topic_id   TEXT        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  is_custom  BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX short_notes_topic_id_idx ON short_notes(topic_id);

-- ============================================================
-- EXAM-LEVEL CONTENT
-- ============================================================

CREATE TABLE exam_news (
  id         TEXT        PRIMARY KEY,
  exam_id    TEXT        NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  date_label TEXT,
  tag        TEXT        NOT NULL CHECK (tag IN ('Notification', 'Admit Card', 'Result', 'Exam Date')),
  accent     TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX exam_news_exam_id_idx ON exam_news(exam_id);
CREATE TRIGGER exam_news_updated_at BEFORE UPDATE ON exam_news
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE exam_pricing (
  exam_id    TEXT        PRIMARY KEY REFERENCES exams(id) ON DELETE CASCADE,
  monthly    INTEGER     NOT NULL DEFAULT 149 CHECK (monthly >= 0),
  sixmonths  INTEGER     NOT NULL DEFAULT 749 CHECK (sixmonths >= 0),
  yearly     INTEGER     NOT NULL DEFAULT 1299 CHECK (yearly >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER exam_pricing_updated_at BEFORE UPDATE ON exam_pricing
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE trick_of_day (
  id         TEXT        PRIMARY KEY,
  trick_id   TEXT        NOT NULL REFERENCES tricks(id) ON DELETE CASCADE,
  date       DATE        NOT NULL UNIQUE,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX trick_of_day_date_idx ON trick_of_day(date);

-- ============================================================
-- APP SETTINGS (singleton — enforced by CHECK on id = 1)
-- ============================================================

CREATE TABLE app_settings (
  id             INTEGER     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  app_name       TEXT        NOT NULL DEFAULT 'KrackIT',
  tagline        TEXT        NOT NULL DEFAULT 'One trick ahead',
  version        TEXT        NOT NULL DEFAULT '1.0.0',
  description    TEXT,
  support_email  TEXT,
  website_url    TEXT,
  privacy_url    TEXT,
  terms_url      TEXT,
  play_store_url TEXT,
  app_store_url  TEXT,
  team_members   JSONB       NOT NULL DEFAULT '[]',
  social_links   JSONB       NOT NULL DEFAULT '[]',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- USER TABLES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE user_profiles (
  id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL DEFAULT '',
  phone          TEXT,
  avatar_url     TEXT,
  tier           TEXT        NOT NULL DEFAULT 'Free' CHECK (tier IN ('Free', 'Exam Pack')),
  streak         INTEGER     NOT NULL DEFAULT 0,
  tricks_learned INTEGER     NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_admin       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX user_profiles_tier_idx ON user_profiles(tier);
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE subscriptions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exam_id        TEXT        REFERENCES exams(id) ON DELETE SET NULL,
  plan_type      TEXT        NOT NULL CHECK (plan_type IN ('exam_pack', 'gold_learner', 'pro')),
  billing_cycle  TEXT        NOT NULL CHECK (billing_cycle IN ('monthly', 'sixmonths', 'yearly')),
  amount_paise   INTEGER     NOT NULL CHECK (amount_paise >= 0),
  status         TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ NOT NULL,
  transaction_id TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_exam_id_idx ON subscriptions(exam_id);
CREATE INDEX subscriptions_expires_at_idx ON subscriptions(expires_at);
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_progress (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trick_id    TEXT        NOT NULL REFERENCES tricks(id) ON DELETE CASCADE,
  mastered    BOOLEAN     NOT NULL DEFAULT FALSE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mastered_at TIMESTAMPTZ,
  UNIQUE (user_id, trick_id)
);
CREATE INDEX user_progress_user_id_idx ON user_progress(user_id);
CREATE INDEX user_progress_trick_id_idx ON user_progress(trick_id);
CREATE INDEX user_progress_mastered_idx ON user_progress(user_id, mastered) WHERE mastered = TRUE;

CREATE TABLE user_bookmarks (
  user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trick_id   TEXT        NOT NULL REFERENCES tricks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, trick_id)
);
CREATE INDEX user_bookmarks_user_id_idx ON user_bookmarks(user_id);

CREATE TABLE user_ratings (
  user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trick_id   TEXT        NOT NULL REFERENCES tricks(id) ON DELETE CASCADE,
  stars      SMALLINT    NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, trick_id)
);
CREATE TRIGGER user_ratings_updated_at BEFORE UPDATE ON user_ratings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Aggregated rating cache — updated by trigger
CREATE TABLE trick_ratings (
  trick_id     TEXT        PRIMARY KEY REFERENCES tricks(id) ON DELETE CASCADE,
  avg_rating   NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_ratings INTEGER     NOT NULL DEFAULT 0,
  star1        INTEGER     NOT NULL DEFAULT 0,
  star2        INTEGER     NOT NULL DEFAULT 0,
  star3        INTEGER     NOT NULL DEFAULT 0,
  star4        INTEGER     NOT NULL DEFAULT 0,
  star5        INTEGER     NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUPPORT & ENGAGEMENT
-- ============================================================

CREATE TABLE support_issues (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_name    TEXT        NOT NULL,
  user_email   TEXT        NOT NULL,
  subject      TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority     TEXT        NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  admin_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX support_issues_user_id_idx ON support_issues(user_id);
CREATE INDEX support_issues_status_idx ON support_issues(status);
CREATE TRIGGER support_issues_updated_at BEFORE UPDATE ON support_issues
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE push_notifications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  body            TEXT        NOT NULL,
  type            TEXT        NOT NULL CHECK (type IN ('streak', 'goal', 'achievement', 'reminder', 'tip', 'exam_news')),
  target          TEXT        NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'free', 'subscribed')),
  target_exam_id  TEXT        REFERENCES exams(id) ON DELETE SET NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  sent_at         TIMESTAMPTZ,
  recipient_count INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX push_notifications_status_idx ON push_notifications(status);
CREATE INDEX push_notifications_scheduled_at_idx ON push_notifications(scheduled_at);
CREATE TRIGGER push_notifications_updated_at BEFORE UPDATE ON push_notifications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Delivered notifications log (per user, for in-app feed)
CREATE TABLE notification_deliveries (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID        NOT NULL REFERENCES push_notifications(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notification_id, user_id)
);
CREATE INDEX notification_deliveries_user_id_idx ON notification_deliveries(user_id);
