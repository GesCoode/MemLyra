CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_reset ON rate_limit_buckets(reset_at);

ALTER TABLE marketplace_decks ADD COLUMN IF NOT EXISTS rating_sum INT NOT NULL DEFAULT 0;
ALTER TABLE marketplace_decks ADD COLUMN IF NOT EXISTS rating_count INT NOT NULL DEFAULT 0;

UPDATE marketplace_decks md
SET
  rating_sum = COALESCE(stats.total, 0),
  rating_count = COALESCE(stats.cnt, 0)
FROM (
  SELECT marketplace_deck_id, SUM(rating)::int AS total, COUNT(*)::int AS cnt
  FROM marketplace_ratings
  GROUP BY marketplace_deck_id
) stats
WHERE md.id = stats.marketplace_deck_id;

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

DROP TRIGGER IF EXISTS trg_marketplace_ratings_stats ON marketplace_ratings;
CREATE TRIGGER trg_marketplace_ratings_stats
AFTER INSERT OR UPDATE OR DELETE ON marketplace_ratings
FOR EACH ROW EXECUTE FUNCTION sync_marketplace_deck_rating_stats();
