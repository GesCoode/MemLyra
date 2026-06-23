CREATE TABLE marketplace_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_deck_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  card_count INT NOT NULL DEFAULT 0,
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
CREATE INDEX idx_marketplace_decks_publisher ON marketplace_decks(publisher_user_id);
CREATE INDEX idx_marketplace_decks_source ON marketplace_decks(publisher_user_id, source_deck_id);
CREATE INDEX idx_marketplace_cards_deck ON marketplace_cards(marketplace_deck_id);
