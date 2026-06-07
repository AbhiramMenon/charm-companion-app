-- ============================================================
-- KrackIT Database Functions & Triggers
-- Migration 003 — Functions
-- ============================================================

-- ============================================================
-- 1. Auto-create user_profile on Supabase auth.users INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO user_profiles (id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. Aggregate trick ratings after user_ratings INSERT/UPDATE/DELETE
-- ============================================================
CREATE OR REPLACE FUNCTION update_trick_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_trick_id TEXT;
  v_total    INTEGER;
  v_avg      NUMERIC(3,2);
  v_s1       INTEGER; v_s2 INTEGER; v_s3 INTEGER; v_s4 INTEGER; v_s5 INTEGER;
BEGIN
  v_trick_id := COALESCE(NEW.trick_id, OLD.trick_id);

  SELECT
    COUNT(*)                                          AS total,
    COALESCE(AVG(stars)::NUMERIC(3,2), 0)            AS avg,
    COUNT(*) FILTER (WHERE stars = 1)                 AS s1,
    COUNT(*) FILTER (WHERE stars = 2)                 AS s2,
    COUNT(*) FILTER (WHERE stars = 3)                 AS s3,
    COUNT(*) FILTER (WHERE stars = 4)                 AS s4,
    COUNT(*) FILTER (WHERE stars = 5)                 AS s5
  INTO v_total, v_avg, v_s1, v_s2, v_s3, v_s4, v_s5
  FROM user_ratings
  WHERE trick_id = v_trick_id;

  INSERT INTO trick_ratings (trick_id, avg_rating, total_ratings, star1, star2, star3, star4, star5, updated_at)
  VALUES (v_trick_id, v_avg, v_total, v_s1, v_s2, v_s3, v_s4, v_s5, NOW())
  ON CONFLICT (trick_id) DO UPDATE SET
    avg_rating    = EXCLUDED.avg_rating,
    total_ratings = EXCLUDED.total_ratings,
    star1         = EXCLUDED.star1,
    star2         = EXCLUDED.star2,
    star3         = EXCLUDED.star3,
    star4         = EXCLUDED.star4,
    star5         = EXCLUDED.star5,
    updated_at    = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_user_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW EXECUTE FUNCTION update_trick_rating();

-- ============================================================
-- 3. Update topics.tricks_count when tricks change
-- ============================================================
CREATE OR REPLACE FUNCTION update_topic_tricks_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_topic_id TEXT;
BEGIN
  v_topic_id := COALESCE(NEW.topic_id, OLD.topic_id);
  UPDATE topics SET tricks_count = (
    SELECT COUNT(*) FROM tricks WHERE topic_id = v_topic_id
  ) WHERE id = v_topic_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_trick_change
  AFTER INSERT OR DELETE ON tricks
  FOR EACH ROW EXECUTE FUNCTION update_topic_tricks_count();

-- ============================================================
-- 4. Update chapters.tricks_count (sum of child topic counts)
-- ============================================================
CREATE OR REPLACE FUNCTION update_chapter_tricks_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_chapter_id TEXT;
BEGIN
  v_chapter_id := COALESCE(NEW.chapter_id, OLD.chapter_id);
  UPDATE chapters SET tricks_count = (
    SELECT COALESCE(SUM(tricks_count), 0) FROM topics WHERE chapter_id = v_chapter_id
  ) WHERE id = v_chapter_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_topic_tricks_count_change
  AFTER UPDATE OF tricks_count ON topics
  FOR EACH ROW EXECUTE FUNCTION update_chapter_tricks_count();

CREATE TRIGGER on_topic_change
  AFTER INSERT OR DELETE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_chapter_tricks_count();

-- ============================================================
-- 5. Update subjects.chapters_count when chapters change
-- ============================================================
CREATE OR REPLACE FUNCTION update_subject_chapters_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_subject_id TEXT;
BEGIN
  v_subject_id := COALESCE(NEW.subject_id, OLD.subject_id);
  UPDATE subjects SET chapters_count = (
    SELECT COUNT(*) FROM chapters WHERE subject_id = v_subject_id
  ) WHERE id = v_subject_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_chapter_change
  AFTER INSERT OR DELETE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_subject_chapters_count();

-- ============================================================
-- 6. Update exams.subjects_count and exams.tricks_count
-- ============================================================
CREATE OR REPLACE FUNCTION update_exam_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_exam_id TEXT;
BEGIN
  v_exam_id := COALESCE(NEW.exam_id, OLD.exam_id);
  UPDATE exams SET
    subjects_count = (SELECT COUNT(*) FROM subjects WHERE exam_id = v_exam_id),
    tricks_count   = (
      SELECT COALESCE(SUM(ch.tricks_count), 0)
      FROM chapters ch
      JOIN subjects s ON s.id = ch.subject_id
      WHERE s.exam_id = v_exam_id
    )
  WHERE id = v_exam_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_subject_change
  AFTER INSERT OR DELETE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_exam_counts();

-- ============================================================
-- 7. Update user_profiles.tricks_learned on user_progress change
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_tricks_learned()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id UUID;
BEGIN
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  UPDATE user_profiles SET tricks_learned = (
    SELECT COUNT(*) FROM user_progress WHERE user_id = v_user_id
  ) WHERE id = v_user_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_user_progress_change
  AFTER INSERT OR DELETE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_user_tricks_learned();

-- ============================================================
-- 8. Update user tier based on active subscriptions
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_user_tier(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE user_profiles SET tier = CASE
    WHEN EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = p_user_id
        AND status = 'active'
        AND expires_at > NOW()
    ) THEN 'Exam Pack'
    ELSE 'Free'
  END
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION on_subscription_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM refresh_user_tier(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_subscription_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION on_subscription_change();

-- ============================================================
-- 9. Analytics helper views
-- ============================================================

CREATE OR REPLACE VIEW v_content_stats AS
SELECT
  (SELECT COUNT(*) FROM exams)       AS exams_count,
  (SELECT COUNT(*) FROM subjects)    AS subjects_count,
  (SELECT COUNT(*) FROM chapters)    AS chapters_count,
  (SELECT COUNT(*) FROM topics)      AS topics_count,
  (SELECT COUNT(*) FROM tricks)      AS tricks_count,
  (SELECT COUNT(*) FROM short_notes) AS notes_count,
  (SELECT COUNT(*) FROM exam_news)   AS news_count;

CREATE OR REPLACE VIEW v_user_stats AS
SELECT
  (SELECT COUNT(*) FROM user_profiles)                               AS total_users,
  (SELECT COUNT(*) FROM user_profiles WHERE tier = 'Exam Pack')      AS subscribed_users,
  (SELECT COUNT(*) FROM user_profiles WHERE tier = 'Free')           AS free_users,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND expires_at > NOW()) AS active_subs,
  (SELECT COUNT(*) FROM subscriptions WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '5 days') AS expiring_soon;

CREATE OR REPLACE VIEW v_revenue_by_exam AS
SELECT
  e.name AS exam_name,
  e.id   AS exam_id,
  COUNT(s.id)             AS subscriptions,
  SUM(s.amount_paise)     AS total_paise,
  AVG(s.amount_paise)     AS avg_paise
FROM exams e
LEFT JOIN subscriptions s ON s.exam_id = e.id AND s.status = 'active'
GROUP BY e.id, e.name;

CREATE OR REPLACE VIEW v_tricks_by_difficulty AS
SELECT difficulty, COUNT(*) AS count FROM tricks GROUP BY difficulty;

CREATE OR REPLACE VIEW v_top_rated_tricks AS
SELECT
  t.id, t.title, t.difficulty,
  tr.avg_rating, tr.total_ratings
FROM tricks t
JOIN trick_ratings tr ON tr.trick_id = t.id
ORDER BY tr.avg_rating DESC, tr.total_ratings DESC
LIMIT 20;

-- ============================================================
-- 10. Search function with full-text ranking
-- ============================================================
CREATE OR REPLACE FUNCTION search_tricks(query TEXT, lim INTEGER DEFAULT 20)
RETURNS TABLE(
  id TEXT, title TEXT, content TEXT, explanation TEXT,
  difficulty TEXT, topic_id TEXT, rank REAL
) LANGUAGE sql STABLE AS $$
  SELECT
    t.id, t.title, t.content, t.explanation,
    t.difficulty, t.topic_id,
    ts_rank(to_tsvector('english', t.title || ' ' || t.content || ' ' || t.explanation),
            plainto_tsquery('english', query)) AS rank
  FROM tricks t
  WHERE to_tsvector('english', t.title || ' ' || t.content || ' ' || t.explanation)
        @@ plainto_tsquery('english', query)
  ORDER BY rank DESC
  LIMIT lim;
$$;

-- ============================================================
-- 11. Get user's subscribed exam IDs
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_subscribed_exams(p_user_id UUID)
RETURNS TABLE(exam_id TEXT) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT DISTINCT s.exam_id
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND s.expires_at > NOW()
    AND s.exam_id IS NOT NULL;
$$;

-- ============================================================
-- 12. Expire subscriptions job (call via pg_cron or Edge Function)
-- ============================================================
CREATE OR REPLACE FUNCTION expire_stale_subscriptions()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE subscriptions SET status = 'expired'
  WHERE status = 'active' AND expires_at <= NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
