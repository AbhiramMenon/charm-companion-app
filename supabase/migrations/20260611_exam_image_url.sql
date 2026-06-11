-- Add optional cover image URL to exams
ALTER TABLE exams ADD COLUMN IF NOT EXISTS image_url text;
