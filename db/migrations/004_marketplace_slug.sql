ALTER TABLE marketplace_decks ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE marketplace_decks
SET slug = regexp_replace(lower(title), '[^a-z0-9]+', '', 'g')
WHERE slug IS NULL OR slug = '';

UPDATE marketplace_decks
SET slug = 'deck' || substr(replace(id::text, '-', ''), 1, 12)
WHERE slug IS NULL OR slug = '';

WITH ranked AS (
  SELECT
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY published_at ASC, id ASC) AS position
  FROM marketplace_decks
  WHERE slug IS NOT NULL
)
UPDATE marketplace_decks md
SET slug = CASE
  WHEN ranked.position = 1 THEN ranked.slug
  ELSE ranked.slug || ranked.position::text
END
FROM ranked
WHERE md.id = ranked.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_decks_slug ON marketplace_decks(slug);
