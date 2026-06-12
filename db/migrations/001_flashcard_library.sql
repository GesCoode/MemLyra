-- Run on existing databases that were initialized with auth-only schema.sql:
-- docker exec -i memlyra-db psql -U memlyra -d memlyra < db/migrations/001_flashcard_library.sql

CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  side_a TEXT NOT NULL,
  side_b TEXT NOT NULL,
  deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,
  times_seen INT NOT NULL DEFAULT 0,
  times_correct INT NOT NULL DEFAULT 0,
  recent_results_a_to_b JSONB NOT NULL DEFAULT '[]',
  recent_results_b_to_a JSONB NOT NULL DEFAULT '[]',
  star BOOLEAN NOT NULL DEFAULT FALSE,
  special_star BOOLEAN NOT NULL DEFAULT FALSE,
  both_ways_star BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  learned_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  both_ways_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS flashcard_tags (
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (flashcard_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_decks_user ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
