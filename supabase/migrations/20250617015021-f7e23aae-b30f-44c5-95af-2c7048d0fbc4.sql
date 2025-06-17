
-- Add new post tags for languages and additional categories
INSERT INTO public.tags (name, emoji, is_sensitive) VALUES
-- Language tags (for filtering only, not displayed on posts)
('Hindi', '🇮🇳', false),
('Hinglish', '🗣️', false), 
('English', '🇺🇸', false),
-- Additional post tags
('Tech', '💻', false),
('Lifestyle', '✨', false),
('Food', '🍕', false);
