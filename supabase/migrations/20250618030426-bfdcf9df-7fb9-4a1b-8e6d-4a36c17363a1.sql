
-- First, let's add the title column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing posts to have titles
UPDATE posts SET title = 'Untitled Post' WHERE title IS NULL;

-- Make title NOT NULL
ALTER TABLE posts ALTER COLUMN title SET NOT NULL;

-- For the content column, let's create a new column for rich text and migrate data
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rich_content JSONB;

-- Migrate existing text content to JSON format
UPDATE posts 
SET rich_content = json_build_object(
  'type', 'doc',
  'content', json_build_array(
    json_build_object(
      'type', 'paragraph',
      'content', json_build_array(
        json_build_object(
          'type', 'text',
          'text', content
        )
      )
    )
  )
)
WHERE rich_content IS NULL;

-- Drop the old content column and rename rich_content to content
ALTER TABLE posts DROP COLUMN content;
ALTER TABLE posts RENAME COLUMN rich_content TO content;

-- Make content NOT NULL
ALTER TABLE posts ALTER COLUMN content SET NOT NULL;
