<script lang="ts">
  import { browser } from '$app/environment';
  import { updateFlashcardDeck } from '$lib/stores/flashcards';
  import type { Deck } from '$lib/stores/decks';
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
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let menuEl = $state<HTMLDivElement | null>(null);

  let currentDeck = $derived(decks.find((deck) => deck.id === deckId));

  function updateMenuPosition() {
    if (!browser || !triggerEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const menuHeight = menuEl?.offsetHeight ?? 140;
    const menuWidth = menuEl?.offsetWidth ?? 160;
    const gap = 6;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const opensUp = spaceBelow < menuHeight + gap;

    let left = triggerRect.left;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    left = Math.max(8, left);

    menuPosition = {
      left,
      top: opensUp
        ? Math.max(8, triggerRect.top - menuHeight - gap)
        : triggerRect.bottom + gap
    };
  }

  function openMenu() {
    menuOpen = true;
    queueMicrotask(() => {
      updateMenuPosition();
      queueMicrotask(updateMenuPosition);
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
    onclick={closeMenu}
  ></button>

  <div
    class="card-tag-editor__menu"
    bind:this={menuEl}
    role="menu"
    aria-label={currentDeck ? 'Change deck' : 'Assign deck'}
    style="top: {menuPosition.top}px; left: {menuPosition.left}px;"
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
  {:else if currentDeck}
    <div class="card-deck-editor__current">
      <button
        class="tag-chip tag-chip-colored tag-chip-deck"
        type="button"
        bind:this={triggerEl}
        style={tagChipStyles(currentDeck.color, true)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onclick={toggleMenu}
      >
        {currentDeck.label}
      </button>
    </div>
  {:else}
    <div class="card-deck-editor__current">
      <button
        class="tag-chip tag-chip-add"
        type="button"
        bind:this={triggerEl}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onclick={toggleMenu}
      >
        + Deck
      </button>
    </div>
  {/if}
</div>
