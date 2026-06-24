<script lang="ts">
  import { modalDialog } from '$lib/actions/modalDialog';
  import {
    republishMarketplaceListing,
    unpublishMarketplaceDeck,
    updateMarketplaceListing,
    type MarketplaceDeckSummary
  } from '$lib/stores/marketplace';

  let {
    open = false,
    listing = null,
    onClose,
    onUpdated,
    onRemoved
  }: {
    open?: boolean;
    listing?: MarketplaceDeckSummary | null;
    onClose: () => void;
    onUpdated?: (deck: MarketplaceDeckSummary, message: string) => void;
    onRemoved?: (message: string) => void;
  } = $props();

  let title = $state('');
  let description = $state('');
  let error = $state('');
  let saving = $state(false);
  let dialogEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (open && listing) {
      title = listing.title;
      description = listing.description;
      error = '';
    }
  });

  async function saveDetails() {
    if (!listing || saving) return;

    saving = true;
    error = '';

    const result = await updateMarketplaceListing(listing.id, title, description);
    saving = false;

    if (result.error || !result.deck) {
      error = result.error ?? 'Could not update listing.';
      return;
    }

    onUpdated?.(result.deck, `Updated listing “${result.deck.title}”.`);
    onClose();
  }

  async function updateCards() {
    if (!listing?.sourceDeckId || saving) return;

    saving = true;
    error = '';

    const result = await republishMarketplaceListing(listing.sourceDeckId, title, description);
    saving = false;

    if (result.error || !result.deck) {
      error = result.error ?? 'Could not update cards.';
      return;
    }

    onUpdated?.(
      result.deck,
      `Updated cards for “${result.deck.title}” from your library (${result.deck.cardCount} cards).`
    );
    onClose();
  }

  async function removeListing() {
    if (!listing || saving) return;

    saving = true;
    error = '';

    const removed = await unpublishMarketplaceDeck(listing.id);
    saving = false;

    if (!removed) {
      error = 'Could not remove listing.';
      return;
    }

    onRemoved?.(`Removed “${listing.title}” from the marketplace.`);
    onClose();
  }
</script>

{#if open && listing}
  <button class="confirm-dialog__backdrop" type="button" aria-label="Close dialog" onclick={onClose}></button>

  <div
    bind:this={dialogEl}
    class="confirm-dialog manage-listing-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="manage-listing-title"
    use:modalDialog={{ onClose }}
  >
    <h3 id="manage-listing-title" class="confirm-dialog__title">Manage listing</h3>
    <p class="confirm-dialog__message">
      Edit how this deck appears in the marketplace. Updating cards re-snapshots your current library deck.
    </p>

    <div class="publish-deck-dialog__form">
      <label class="library-field">
        <span class="field-label">Marketplace name</span>
        <input class="field-input" bind:value={title} required maxlength="120" disabled={saving} />
      </label>

      <label class="library-field">
        <span class="field-label">Description <span class="text-muted">(optional)</span></span>
        <textarea
          class="field-input min-h-24 resize-y"
          bind:value={description}
          maxlength="500"
          disabled={saving}
        ></textarea>
      </label>

      {#if error}
        <p class="library-message library-message-error">{error}</p>
      {/if}

      <div class="confirm-dialog__actions">
        <button class="btn-secondary" type="button" onclick={onClose} disabled={saving}>Cancel</button>
        <button class="btn-danger" type="button" onclick={removeListing} disabled={saving}>
          Remove listing
        </button>
        {#if listing.sourceDeckId}
          <button class="btn-secondary" type="button" onclick={updateCards} disabled={saving}>
            {saving ? 'Updating…' : 'Update cards'}
          </button>
        {/if}
        <button class="btn-publish" type="button" onclick={saveDetails} disabled={saving}>
          {saving ? 'Saving…' : 'Save details'}
        </button>
      </div>
    </div>
  </div>
{/if}
