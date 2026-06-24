CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE flashcards (
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

CREATE TABLE flashcard_tags (
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (flashcard_id, tag_id)
);

CREATE INDEX idx_decks_user ON decks(user_id);
CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);

CREATE TABLE marketplace_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_deck_id UUID,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  card_count INT NOT NULL DEFAULT 0,
  rating_sum INT NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_listed BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE marketplace_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_deck_id UUID NOT NULL REFERENCES marketplace_decks(id) ON DELETE CASCADE,
  side_a TEXT NOT NULL,
  side_b TEXT NOT NULL,
  tag_labels JSONB NOT NULL DEFAULT '[]',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_marketplace_decks_listed ON marketplace_decks(is_listed, published_at DESC);
CREATE UNIQUE INDEX idx_marketplace_decks_slug ON marketplace_decks(slug);
CREATE INDEX idx_marketplace_decks_publisher ON marketplace_decks(publisher_user_id);
CREATE INDEX idx_marketplace_decks_source ON marketplace_decks(publisher_user_id, source_deck_id);
CREATE INDEX idx_marketplace_cards_deck ON marketplace_cards(marketplace_deck_id);

CREATE TABLE marketplace_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_deck_id UUID NOT NULL REFERENCES marketplace_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (marketplace_deck_id, user_id)
);

CREATE INDEX idx_marketplace_ratings_deck ON marketplace_ratings(marketplace_deck_id);
CREATE INDEX idx_marketplace_ratings_user ON marketplace_ratings(user_id);

CREATE TABLE rate_limit_buckets (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_rate_limit_reset ON rate_limit_buckets(reset_at);

CREATE OR REPLACE FUNCTION sync_marketplace_deck_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE marketplace_decks
    SET
      rating_sum = GREATEST(0, rating_sum - OLD.rating),
      rating_count = GREATEST(0, rating_count - 1)
    WHERE id = OLD.marketplace_deck_id;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    UPDATE marketplace_decks
    SET
      rating_sum = rating_sum + NEW.rating,
      rating_count = rating_count + 1
    WHERE id = NEW.marketplace_deck_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.marketplace_deck_id IS DISTINCT FROM NEW.marketplace_deck_id THEN
      UPDATE marketplace_decks
      SET
        rating_sum = GREATEST(0, rating_sum - OLD.rating),
        rating_count = GREATEST(0, rating_count - 1)
      WHERE id = OLD.marketplace_deck_id;
      UPDATE marketplace_decks
      SET
        rating_sum = rating_sum + NEW.rating,
        rating_count = rating_count + 1
      WHERE id = NEW.marketplace_deck_id;
    ELSIF OLD.rating IS DISTINCT FROM NEW.rating THEN
      UPDATE marketplace_decks
      SET rating_sum = rating_sum - OLD.rating + NEW.rating
      WHERE id = NEW.marketplace_deck_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_marketplace_ratings_stats
AFTER INSERT OR UPDATE OR DELETE ON marketplace_ratings
FOR EACH ROW EXECUTE FUNCTION sync_marketplace_deck_rating_stats();

CREATE TABLE schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (id) VALUES
  ('001_flashcard_library.sql'),
  ('002_marketplace.sql'),
  ('003_marketplace_ratings.sql'),
  ('004_marketplace_slug.sql'),
  ('005_rate_limits_and_rating_stats.sql');
