-- ============================================================
-- KrackIT Row Level Security Policies
-- Migration 002 — RLS
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE exams                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects                ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters                ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tricks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_news               ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_pricing            ENABLE ROW LEVEL SECURITY;
ALTER TABLE trick_of_day            ENABLE ROW LEVEL SECURITY;
ALTER TABLE trick_ratings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_issues          ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION — check if caller is an admin user
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- ============================================================
-- PUBLIC CONTENT — anyone authenticated can read
-- Admins can do full CRUD via is_admin() check
-- ============================================================

-- EXAMS
CREATE POLICY "exams_select" ON exams
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "exams_insert" ON exams
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "exams_update" ON exams
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "exams_delete" ON exams
  FOR DELETE TO authenticated USING (is_admin());

-- SUBJECTS
CREATE POLICY "subjects_select" ON subjects
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "subjects_insert" ON subjects
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "subjects_update" ON subjects
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE TO authenticated USING (is_admin());

-- CHAPTERS
CREATE POLICY "chapters_select" ON chapters
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "chapters_insert" ON chapters
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "chapters_update" ON chapters
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "chapters_delete" ON chapters
  FOR DELETE TO authenticated USING (is_admin());

-- TOPICS
CREATE POLICY "topics_select" ON topics
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "topics_insert" ON topics
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "topics_update" ON topics
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "topics_delete" ON topics
  FOR DELETE TO authenticated USING (is_admin());

-- TRICKS
CREATE POLICY "tricks_select" ON tricks
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "tricks_insert" ON tricks
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "tricks_update" ON tricks
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "tricks_delete" ON tricks
  FOR DELETE TO authenticated USING (is_admin());

-- SHORT NOTES
CREATE POLICY "short_notes_select" ON short_notes
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "short_notes_insert" ON short_notes
  FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_custom = TRUE);
CREATE POLICY "short_notes_update" ON short_notes
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "short_notes_delete" ON short_notes
  FOR DELETE TO authenticated USING (is_admin());

-- EXAM NEWS
CREATE POLICY "exam_news_select" ON exam_news
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "exam_news_insert" ON exam_news
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "exam_news_update" ON exam_news
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "exam_news_delete" ON exam_news
  FOR DELETE TO authenticated USING (is_admin());

-- EXAM PRICING — publicly readable (unauthenticated) for landing page
CREATE POLICY "exam_pricing_select_anon" ON exam_pricing
  FOR SELECT TO anon USING (TRUE);
CREATE POLICY "exam_pricing_select" ON exam_pricing
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "exam_pricing_insert" ON exam_pricing
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "exam_pricing_update" ON exam_pricing
  FOR UPDATE TO authenticated USING (is_admin());

-- TRICK OF DAY
CREATE POLICY "trick_of_day_select" ON trick_of_day
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "trick_of_day_insert" ON trick_of_day
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "trick_of_day_update" ON trick_of_day
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "trick_of_day_delete" ON trick_of_day
  FOR DELETE TO authenticated USING (is_admin());

-- TRICK RATINGS (aggregated — read-only for users, managed by trigger)
CREATE POLICY "trick_ratings_select" ON trick_ratings
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "trick_ratings_admin_all" ON trick_ratings
  FOR ALL TO authenticated USING (is_admin());

-- APP SETTINGS — publicly readable
CREATE POLICY "app_settings_select_anon" ON app_settings
  FOR SELECT TO anon USING (TRUE);
CREATE POLICY "app_settings_select" ON app_settings
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "app_settings_update" ON app_settings
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "app_settings_insert" ON app_settings
  FOR INSERT TO authenticated WITH CHECK (is_admin());

-- ============================================================
-- USER PROFILES — own-row access + admin full access
-- ============================================================
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR is_admin());
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR is_admin());
-- Inserted by trigger handle_new_user (SECURITY DEFINER), no user insert needed

-- ============================================================
-- SUBSCRIPTIONS — own rows + admin
-- ============================================================
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "subscriptions_insert_own" ON subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR is_admin());
CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "subscriptions_delete_admin" ON subscriptions
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- USER PROGRESS — own rows only
-- ============================================================
CREATE POLICY "user_progress_select_own" ON user_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_progress_insert_own" ON user_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_progress_update_own" ON user_progress
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_progress_delete_own" ON user_progress
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- BOOKMARKS — own rows only
-- ============================================================
CREATE POLICY "user_bookmarks_select_own" ON user_bookmarks
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_bookmarks_insert_own" ON user_bookmarks
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_bookmarks_delete_own" ON user_bookmarks
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- USER RATINGS — own rows only, aggregates visible to all
-- ============================================================
CREATE POLICY "user_ratings_select_own" ON user_ratings
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_ratings_insert_own" ON user_ratings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_ratings_update_own" ON user_ratings
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_ratings_delete_own" ON user_ratings
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- SUPPORT ISSUES — users can create + see their own, admin sees all
-- ============================================================
CREATE POLICY "support_issues_select" ON support_issues
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "support_issues_insert" ON support_issues
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR is_admin());
CREATE POLICY "support_issues_update" ON support_issues
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "support_issues_delete" ON support_issues
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- PUSH NOTIFICATIONS — all authenticated can read sent ones
-- ============================================================
CREATE POLICY "push_notifications_select" ON push_notifications
  FOR SELECT TO authenticated USING (status = 'sent' OR is_admin());
CREATE POLICY "push_notifications_insert" ON push_notifications
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "push_notifications_update" ON push_notifications
  FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "push_notifications_delete" ON push_notifications
  FOR DELETE TO authenticated USING (is_admin());

-- NOTIFICATION DELIVERIES
CREATE POLICY "notif_deliveries_select_own" ON notification_deliveries
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "notif_deliveries_update_own" ON notification_deliveries
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_deliveries_insert_admin" ON notification_deliveries
  FOR INSERT TO authenticated WITH CHECK (is_admin());
