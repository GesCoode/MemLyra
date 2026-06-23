<script lang="ts">
  import { decks } from '$lib/stores/decks';
  import { flashcards } from '$lib/stores/flashcards';
  import { publishDeckToMarketplace } from '$lib/stores/marketplace';
  import { deckIndexStyle } from '$lib/utils/tagColors';

  let {
    open = false,
    deckId = null,
    defaultTitle = '',
    onClose,
    onPublished
  }: {
    open?: boolean;
    deckId?: string | null;
    defaultTitle?: string;
    onClose: () => void;
    onPublished?: (message: string) => void;
  } = $props();

  type Step = 'pick' | 'details';

  let step = $state<Step>('pick');
  let selectedDeckId = $state<string | null>(null);
  let title = $state('');
  let description = $state('');
  let error = $state('');
  let submitting = $state(false);

  function deckCardCount(id: string): number {
    return $flashcards.filter((card) => card.deckId === id).length;
  }

  let publishableDecks = $derived(
    $decks.filter((deck) => deckCardCount(deck.id) > 0)
  );

  $effect(() => {
    if (!open) return;

    if (deckId) {
      step = 'details';
      selectedDeckId = deckId;
      title = defaultTitle;
    } else {
      step = 'pick';
      selectedDeckId = null;
      title = '';
    }

    description = '';
    error = '';
  });

  function pickDeck(id: string, label: string) {
    selectedDeckId = id;
    title = label;
    step = 'details';
    error = '';
  }

  function backToPick() {
    if (deckId) {
      onClose();
      return;
    }

    step = 'pick';
    selectedDeckId = null;
    error = '';
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!selectedDeckId || submitting) return;

    submitting = true;
    error = '';

    const result = await publishDeckToMarketplace(selectedDeckId, title, description);
    submitting = false;

    if (result.error) {
      error = result.error;
      return;
    }

    onPublished?.(`Published “${result.deck?.title ?? title}” to the marketplace.`);
    onClose();
  }
</script>

{#if open}
  <button class="confirm-dialog__backdrop" type="button" aria-label="Close dialog" onclick={onClose}></button>

  <div
    class="confirm-dialog publish-deck-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="publish-deck-title"
  >
    {#if step === 'pick'}
      <h3 id="publish-deck-title" class="confirm-dialog__title">Publish deck</h3>
      <p class="confirm-dialog__message">
        Choose a deck from your library to share in the marketplace.
      </p>

      {#if publishableDecks.length === 0}
        <p class="marketplace-page__status">
          Add cards to a deck in your library before publishing.
        </p>
        <div class="confirm-dialog__actions">
          <button class="btn-secondary" type="button" onclick={onClose}>Close</button>
        </div>
      {:else}
        <ul class="publish-deck-dialog__deck-list">
          {#each publishableDecks as deck (deck.id)}
            {@const count = deckCardCount(deck.id)}
            <li>
              <button
                class="publish-deck-dialog__deck-item"
                type="button"
                onclick={() => pickDeck(deck.id, deck.label)}
              >
                <span class="marketplace-page__swatch" style={deckIndexStyle(deck.color)} aria-hidden="true"></span>
                <span class="publish-deck-dialog__deck-body">
                  <span class="marketplace-page__deck-title">{deck.label}</span>
                  <span class="marketplace-page__deck-meta">
                    {count} card{count === 1 ? '' : 's'}
                  </span>
                </span>
              </button>
            </li>
          {/each}
        </ul>

        <div class="confirm-dialog__actions">
          <button class="btn-secondary" type="button" onclick={onClose}>Cancel</button>
        </div>
      {/if}
    {:else}
      <h3 id="publish-deck-title" class="confirm-dialog__title">Publish to marketplace</h3>
      <p class="confirm-dialog__message">
        Choose how this deck appears in the marketplace. Cards are snapshotted when you publish.
      </p>

      <form class="publish-deck-dialog__form" onsubmit={handleSubmit}>
        <label class="library-field">
          <span class="field-label">Marketplace name</span>
          <input class="field-input" bind:value={title} required maxlength="120" />
        </label>

        <label class="library-field">
          <span class="field-label">Description <span class="text-muted">(optional)</span></span>
          <textarea
            class="field-input min-h-24 resize-y"
            bind:value={description}
            maxlength="500"
            placeholder="What is this deck about?"
          ></textarea>
        </label>

        {#if error}
          <p class="library-message library-message-error">{error}</p>
        {/if}

        <div class="confirm-dialog__actions">
          <button class="btn-secondary" type="button" onclick={backToPick}>
            {deckId ? 'Cancel' : 'Back'}
          </button>
          <button class="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish deck'}
          </button>
        </div>
      </form>
    {/if}
  </div>
{/if}
