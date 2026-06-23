<script lang="ts">
  import { browser } from '$app/environment';
  import { updateFlashcardDeck } from '$lib/stores/flashcards';
  import type { Deck } from '$lib/stores/decks';
  import { getFixedMenuPosition } from '$lib/utils/anchoredMenu';
  import { portal } from '$lib/utils/portal';
  import { tagChipStyles } from '$lib/utils/tagColors';

  let {
    cardId,
    deckId = null,
    decks = []
  }: {
    cardId: string;
    deckId?: string | null;
    decks?: Deck[];
  } = $props();

  let menuOpen = $state(false);
  let menuPosition = $state({ top: 0, left: 0 });
  let anchorEl = $state<HTMLSpanElement | null>(null);
  let menuEl = $state<HTMLDivElement | null>(null);

  let currentDeck = $derived(decks.find((deck) => deck.id === deckId));

  function updateMenuPlacement() {
    if (!browser || !anchorEl) return;
    menuPosition = getFixedMenuPosition(anchorEl, menuEl);
  }

  function openMenu() {
    menuOpen = true;
    queueMicrotask(() => {
      updateMenuPlacement();
      queueMicrotask(updateMenuPlacement);
    });
  }

  function closeMenu() {
    menuOpen = false;
  }

  function selectDeck(nextDeckId: string) {
    if (nextDeckId === deckId) {
      closeMenu();
      return;
    }

    void updateFlashcardDeck(cardId, nextDeckId);
    closeMenu();
  }

  function toggleMenu() {
    if (decks.length === 0) return;
    if (menuOpen) {
      closeMenu();
      return;
    }
    openMenu();
  }
</script>

{#if menuOpen}
  <button
    class="card-tag-editor__backdrop"
    type="button"
    aria-label="Close deck menu"
    use:portal
    onclick={closeMenu}
  ></button>

  <div
    class="card-tag-editor__menu card-tag-editor__menu--floating"
    style:top="{menuPosition.top}px"
    style:left="{menuPosition.left}px"
    bind:this={menuEl}
    use:portal
    role="menu"
    aria-label={currentDeck ? 'Change deck' : 'Assign deck'}
  >
    {#each decks as deck (deck.id)}
      <button
        class="card-tag-editor__menu-item {deck.id === deckId ? 'card-deck-editor__menu-item-active' : ''}"
        type="button"
        role="menuitem"
        style={tagChipStyles(deck.color, deck.id === deckId)}
        onclick={() => selectDeck(deck.id)}
      >
        {deck.label}
      </button>
    {/each}
  </div>
{/if}

<div class="card-deck-editor">
  {#if decks.length === 0}
    <span class="card-tag-editor__hint">Create decks below</span>
  {:else}
    <span class="card-tag-editor__anchor card-deck-editor__anchor" bind:this={anchorEl}>
      {#if currentDeck}
        <button
          class="tag-chip tag-chip-colored tag-chip-deck"
          type="button"
          style={tagChipStyles(currentDeck.color, true)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onclick={toggleMenu}
        >
          {currentDeck.label}
        </button>
      {:else}
        <button
          class="tag-chip tag-chip-add"
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onclick={toggleMenu}
        >
          + Deck
        </button>
      {/if}
    </span>
  {/if}
</div>
