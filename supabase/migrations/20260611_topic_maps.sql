-- Create topic_maps table
CREATE TABLE IF NOT EXISTS topic_maps (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    text        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  image_url   text        NOT NULL,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE topic_maps ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read maps
CREATE POLICY "topic_maps_read" ON topic_maps
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "topic_maps_admin_insert" ON topic_maps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "topic_maps_admin_update" ON topic_maps
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "topic_maps_admin_delete" ON topic_maps
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );
