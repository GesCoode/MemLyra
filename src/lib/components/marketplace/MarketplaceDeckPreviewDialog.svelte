<script lang="ts">
  import MarketplaceStarRating from '$lib/components/marketplace/MarketplaceStarRating.svelte';
  import {
    fetchMarketplaceDeck,
    rateMarketplaceDeck,
    type MarketplaceDeckDetail,
    type MarketplaceDeckSummary
  } from '$lib/stores/marketplace';
  import {
    formatMarketplaceRating,
    MARKETPLACE_PREVIEW_CARD_COUNT
  } from '$lib/utils/marketplace';
  import { deckIndexStyle } from '$lib/utils/tagColors';

  let {
    open = false,
    deckId = null,
    canRate = false,
    loginHref = '/login',
    onClose,
    onImport,
    onUpdated
  }: {
    open?: boolean;
    deckId?: string | null;
    canRate?: boolean;
    loginHref?: string;
    onClose: () => void;
    onImport?: (deck: MarketplaceDeckSummary) => void;
    onUpdated?: (deck: MarketplaceDeckSummary) => void;
  } = $props();

  let detail = $state<MarketplaceDeckDetail | null>(null);
  let loading = $state(false);
  let error = $state('');
  let showAllCards = $state(false);
  let ratingMessage = $state('');
  let ratingSaving = $state(false);

  let previewCards = $derived(
    detail && !showAllCards
      ? detail.cards.slice(0, MARKETPLACE_PREVIEW_CARD_COUNT)
      : (detail?.cards ?? [])
  );

  $effect(() => {
    if (!open || !deckId) {
      detail = null;
      error = '';
      showAllCards = false;
      ratingMessage = '';
      return;
    }

    void loadDetail(deckId);
  });

  async function loadDetail(id: string) {
    loading = true;
    error = '';
    detail = null;
    showAllCards = false;

    try {
      const result = await fetchMarketplaceDeck(id);
      if (!result) {
        error = 'Could not load this deck.';
        return;
      }

      detail = result;
    } catch {
      error = 'Could not load this deck.';
    } finally {
      loading = false;
    }
  }

  async function handleRate(rating: number) {
    if (!deckId || !canRate || ratingSaving) return;

    ratingSaving = true;
    ratingMessage = '';

    const result = await rateMarketplaceDeck(deckId, rating);
    ratingSaving = false;

    if (result.error) {
      ratingMessage = result.error;
      return;
    }

    if (result.deck) {
      detail = detail ? { ...detail, ...result.deck } : null;
      onUpdated?.(result.deck);
      ratingMessage = 'Thanks for rating this deck.';
    }
  }

  function handleImport() {
    if (!detail) return;
    onImport?.(detail);
  }
</script>

{#if open && deckId}
  <button class="confirm-dialog__backdrop" type="button" aria-label="Close dialog" onclick={onClose}></button>

  <div
    class="confirm-dialog marketplace-preview-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="marketplace-preview-title"
  >
    {#if loading}
      <p class="marketplace-page__status">Loading deck…</p>
    {:else if error}
      <p class="library-message library-message-error">{error}</p>
      <div class="confirm-dialog__actions">
        <button class="btn-secondary" type="button" onclick={onClose}>Close</button>
      </div>
    {:else if detail}
      <header class="marketplace-detail__header">
        <div>
          <h3 id="marketplace-preview-title" class="marketplace-detail__title">{detail.title}</h3>
          <p class="marketplace-detail__meta">
            by {detail.publisherName} · {detail.cardCount} card{detail.cardCount === 1 ? '' : 's'}
          </p>
        </div>
        <span class="marketplace-detail__badge" style={deckIndexStyle(detail.color)}>Deck</span>
      </header>

      {#if detail.description}
        <p class="marketplace-detail__desc">{detail.description}</p>
      {/if}

      <div class="marketplace-detail__stats">
        <div class="marketplace-detail__stat">
          <span class="marketplace-detail__stat-label">Average rating</span>
          <div class="marketplace-detail__rating-row">
            <MarketplaceStarRating value={detail.averageRating} />
            <span class="marketplace-detail__rating-text">
              {formatMarketplaceRating(detail.averageRating, detail.ratingCount)}
            </span>
          </div>
        </div>

        <div class="marketplace-detail__stat">
          <span class="marketplace-detail__stat-label">Your rating</span>
          {#if canRate}
            <MarketplaceStarRating
              value={detail.userRating ?? 0}
              interactive
              label="Rate this deck"
              onChange={handleRate}
            />
            {#if ratingMessage}
              <p class="marketplace-detail__hint">{ratingMessage}</p>
            {/if}
          {:else}
            <p class="marketplace-detail__hint">
              <a class="btn-text-link" href={loginHref}>Log in</a> to rate decks.
            </p>
          {/if}
        </div>
      </div>

      <section class="marketplace-detail__preview" aria-labelledby="marketplace-preview-cards-heading">
        <div class="marketplace-detail__preview-header">
          <h4 id="marketplace-preview-cards-heading" class="marketplace-detail__preview-title">
            {showAllCards ? 'All cards' : 'Preview'}
          </h4>
          {#if detail.cards.length > MARKETPLACE_PREVIEW_CARD_COUNT}
            <button class="btn-text-link" type="button" onclick={() => (showAllCards = !showAllCards)}>
              {showAllCards ? 'Show preview' : `See all ${detail.cardCount} cards`}
            </button>
          {/if}
        </div>

        <div class="marketplace-detail__table-wrap">
          <table class="marketplace-detail__table">
            <thead>
              <tr>
                <th scope="col">Side A</th>
                <th scope="col">Side B</th>
              </tr>
            </thead>
            <tbody>
              {#each previewCards as card}
                <tr>
                  <td>{card.sideA}</td>
                  <td>{card.sideB}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <div class="confirm-dialog__actions">
        <button class="btn-secondary" type="button" onclick={onClose}>Close</button>
        {#if onImport}
          <button class="btn-primary" type="button" onclick={handleImport}>
            Import {detail.cardCount} card{detail.cardCount === 1 ? '' : 's'}
          </button>
        {/if}
      </div>
    {/if}
  </div>
{/if}
