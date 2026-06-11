-- Create unified public storage bucket for all KrackIT assets (maps, exam covers, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'krackit-assets',
  'krackit-assets',
  true,
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read (anyone can view images)
DO $$ BEGIN
  CREATE POLICY "krackit_assets_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'krackit-assets');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated users (admins) can upload
DO $$ BEGIN
  CREATE POLICY "krackit_assets_authenticated_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'krackit-assets' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated users (admins) can delete
DO $$ BEGIN
  CREATE POLICY "krackit_assets_authenticated_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'krackit-assets' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
