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
