<script lang="ts">
  import { browser } from '$app/environment';
  import CollapsibleSection from '$lib/components/CollapsibleSection.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import CardDeckEditor from '$lib/components/library/CardDeckEditor.svelte';
  import CardTagEditor from '$lib/components/library/CardTagEditor.svelte';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import {
    createFlashcard,
    deleteFlashcard,
    deleteFlashcards,
    deleteFlashcardsInDeck,
    flashcards,
    importFlashcardRows,
    type Flashcard,
    type ImportResult
  } from '$lib/stores/flashcards';
  import { createDeck, decks, deleteDeck, renameDeck } from '$lib/stores/decks';
  import { createTag, deleteTag, renameTag, tags } from '$lib/stores/tags';
  import { parseImportText } from '$lib/utils/importFlashcards';
  import { sortFlashcards, type SortDirection, type SortField } from '$lib/utils/sortFlashcards';
  import { deckIndexStyle, tagChipStyles, tagDotStyle } from '$lib/utils/tagColors';

  type PanelMode = 'none' | 'delete';

  type ConfirmAction =
    | { type: 'remove-deck'; deckId: string; deckLabel: string }
    | { type: 'clear-deck-cards'; deckId: string; deckLabel: string; count: number }
    | { type: 'remove-tag'; tagId: string; tagLabel: string }
    | { type: 'remove-card'; cardId: string; sideA: string; sideB: string };

  let panelMode = $state<PanelMode>('none');
  let confirmAction = $state<ConfirmAction | null>(null);
  let addFormOpen = $state(false);
  let sortField = $state<SortField>('addedDate');
  let sortDirection = $state<SortDirection>('desc');
  let selectedIds = $state<string[]>([]);
  let wordListOpen = $state(true);
  let decksOpen = $state(true);
  let tagsOpen = $state(true);
  let importOpen = $state(false);

  let wordA = $state('');
  let wordB = $state('');
  let addTagIds = $state<string[]>([]);
  let addDeckId = $state<string | null>(null);
  let addError = $state('');
  let addFormSaved = $state(false);

  let deckLabel = $state('');
  let deckError = $state('');
  let deckFilter = $state('all');
  let pageSize = $state(20);
  let currentPage = $state(1);

  let tagLabel = $state('');
  let tagError = $state('');

  let editingDeckId = $state<string | null>(null);
  let editingDeckLabel = $state('');
  let deckRenameError = $state('');

  let editingTagId = $state<string | null>(null);
  let editingTagLabel = $state('');
  let tagRenameError = $state('');

  let deckRenameInputEl = $state<HTMLInputElement | null>(null);
  let tagRenameInputEl = $state<HTMLInputElement | null>(null);

  let importText = $state('');
  let importDeckId = $state<string | null>(null);
  let importFileName = $state('');
  let importFileError = $state('');
  let importResult = $state<ImportResult | null>(null);

  let highlightedId = $state<string | null>(null);
  let flyingCard = $state<{
    sideA: string;
    sideB: string;
    x: number;
    y: number;
    opacity: number;
    scale: number;
  } | null>(null);

  let saveButtonEl = $state<HTMLButtonElement | null>(null);
  let tableWrapEl = $state<HTMLDivElement | null>(null);
  let wordAInputEl = $state<HTMLInputElement | null>(null);

  let sortedCards = $derived(
    sortFlashcards($flashcards, $tags, sortField, sortDirection, $decks)
  );

  let displayCards = $derived(
    deckFilter === 'all'
      ? sortedCards
      : deckFilter === 'none'
        ? sortedCards.filter((card) => !card.deckId)
        : sortedCards.filter((card) => card.deckId === deckFilter)
  );

  let totalPages = $derived(Math.max(1, Math.ceil(displayCards.length / pageSize)));
  let pageStart = $derived((currentPage - 1) * pageSize);
  let paginatedCards = $derived(displayCards.slice(pageStart, pageStart + pageSize));
  let pageEnd = $derived(Math.min(pageStart + pageSize, displayCards.length));

  const pageSizeOptions = [20, 50, 100];

  $effect(() => {
    deckFilter;
    sortField;
    sortDirection;
    currentPage = 1;
  });

  $effect(() => {
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
  });

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'deck', label: 'Deck' },
    { value: 'tag', label: 'Tags' },
    { value: 'alphabetical', label: 'Alphabetically' },
    { value: 'star', label: 'Star' },
    { value: 'specialStar', label: 'Mastered' },
    { value: 'bothWaysStar', label: 'Both ways star' },
    { value: 'addedDate', label: 'Added date' },
    { value: 'learnedDate', label: 'Learned date' }
  ];

  function deckCardCount(deckId: string): number {
    return $flashcards.filter((card) => card.deckId === deckId).length;
  }

  function selectAddDeck(deckId: string) {
    addDeckId = deckId;
  }

  function toggleAddForm() {
    addFormOpen = !addFormOpen;
    addError = '';
    if (addFormOpen) {
      panelMode = 'none';
      selectedIds = [];
      if ($decks.length === 1) {
        addDeckId = $decks[0]?.id ?? null;
      }
      queueMicrotask(() => wordAInputEl?.focus());
    }
  }

  function toggleDeleteMode() {
    const nextMode = panelMode === 'delete' ? 'none' : 'delete';
    panelMode = nextMode;
    if (nextMode === 'delete') {
      addFormOpen = false;
      wordA = '';
      wordB = '';
      addTagIds = [];
      addDeckId = null;
    } else {
      selectedIds = [];
    }
  }

  function toggleAddTag(tagId: string) {
    addTagIds = addTagIds.includes(tagId)
      ? addTagIds.filter((id) => id !== tagId)
      : [...addTagIds, tagId];
  }

  function toggleSelected(cardId: string) {
    selectedIds = selectedIds.includes(cardId)
      ? selectedIds.filter((id) => id !== cardId)
      : [...selectedIds, cardId];
  }

  function playFlyAnimation(card: Flashcard) {
    if (!browser || !saveButtonEl || !tableWrapEl) return;

    const from = saveButtonEl.getBoundingClientRect();
    const to = tableWrapEl.getBoundingClientRect();

    flyingCard = {
      sideA: card.sideA,
      sideB: card.sideB,
      x: from.left + from.width / 2,
      y: from.top,
      opacity: 1,
      scale: 1
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!flyingCard) return;
        flyingCard = {
          ...flyingCard,
          x: to.left + Math.min(to.width * 0.35, 220),
          y: to.top + 36,
          opacity: 0,
          scale: 0.72
        };
      });
    });

    highlightedId = card.id;
    setTimeout(() => {
      flyingCard = null;
    }, 700);
    setTimeout(() => {
      highlightedId = null;
    }, 1400);
  }

  async function handleAddCard(event: SubmitEvent) {
    event.preventDefault();
    addError = '';

    if ($decks.length > 0 && !addDeckId) {
      addError = 'Select a deck for this card.';
      return;
    }

    const card = await createFlashcard(wordA, wordB, addTagIds, addDeckId);
    if (!card) {
      addError = 'Enter both side A and side B.';
      return;
    }

    playFlyAnimation(card);
    wordA = '';
    wordB = '';
    addTagIds = [];
    addFormSaved = false;
    requestAnimationFrame(() => {
      addFormSaved = true;
      setTimeout(() => {
        addFormSaved = false;
      }, 1200);
    });
    wordAInputEl?.focus();
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;
    await deleteFlashcards(selectedIds);
    selectedIds = [];
    panelMode = 'none';
  }

  async function handleCreateDeck(event: SubmitEvent) {
    event.preventDefault();
    deckError = '';

    const deck = await createDeck(deckLabel);
    if (!deck) {
      deckError = 'Enter a deck name, or this deck already exists.';
      return;
    }

    deckLabel = '';
    if (!addDeckId) addDeckId = deck.id;
    if (!importDeckId) importDeckId = deck.id;
  }

  async function handleRemoveDeck(deckId: string) {
    await deleteDeck(deckId);
    if (addDeckId === deckId) addDeckId = null;
    if (importDeckId === deckId) importDeckId = null;
    if (deckFilter === deckId) deckFilter = 'all';
  }

  async function handleClearDeckCards(deckId: string) {
    const idsInDeck = $flashcards
      .filter((card) => card.deckId === deckId)
      .map((card) => card.id);

    await deleteFlashcardsInDeck(deckId);
    selectedIds = selectedIds.filter((id) => !idsInDeck.includes(id));
  }

  function requestRemoveDeck(deckId: string, deckLabel: string) {
    confirmAction = { type: 'remove-deck', deckId, deckLabel };
  }

  function requestClearDeckCards(deckId: string, deckLabel: string, count: number) {
    confirmAction = { type: 'clear-deck-cards', deckId, deckLabel, count };
  }

  function requestRemoveTag(tagId: string, tagLabel: string) {
    confirmAction = { type: 'remove-tag', tagId, tagLabel };
  }

  function requestRemoveCard(card: Flashcard) {
    confirmAction = {
      type: 'remove-card',
      cardId: card.id,
      sideA: card.sideA,
      sideB: card.sideB
    };
  }

  function handleConfirmAction() {
    if (!confirmAction) return;

    const action = confirmAction;
    confirmAction = null;

    void (async () => {
      switch (action.type) {
        case 'remove-deck':
          await handleRemoveDeck(action.deckId);
          break;
        case 'clear-deck-cards':
          await handleClearDeckCards(action.deckId);
          break;
        case 'remove-tag':
          await handleRemoveTag(action.tagId);
          break;
        case 'remove-card': {
          const { cardId } = action;
          await deleteFlashcard(cardId);
          selectedIds = selectedIds.filter((id) => id !== cardId);
          break;
        }
      }
    })();
  }

  function cancelConfirmAction() {
    confirmAction = null;
  }

  async function handleCreateTag(event: SubmitEvent) {
    event.preventDefault();
    tagError = '';

    const tag = await createTag(tagLabel);
    if (!tag) {
      tagError = 'Enter a tag name, or this tag already exists.';
      return;
    }

    tagLabel = '';
  }

  async function handleRemoveTag(tagId: string) {
    await deleteTag(tagId);
  }

  function startRenameDeck(deckId: string, label: string) {
    cancelTagRename();
    editingDeckId = deckId;
    editingDeckLabel = label;
    deckRenameError = '';
    queueMicrotask(() => deckRenameInputEl?.focus());
  }

  function cancelDeckRename() {
    editingDeckId = null;
    editingDeckLabel = '';
    deckRenameError = '';
  }

  async function saveDeckRename(event: SubmitEvent) {
    event.preventDefault();
    if (!editingDeckId) return;

    if (!(await renameDeck(editingDeckId, editingDeckLabel))) {
      deckRenameError = 'Enter a name, or another deck already uses it.';
      return;
    }

    cancelDeckRename();
  }

  function startRenameTag(tagId: string, label: string) {
    cancelDeckRename();
    editingTagId = tagId;
    editingTagLabel = label;
    tagRenameError = '';
    queueMicrotask(() => tagRenameInputEl?.focus());
  }

  function cancelTagRename() {
    editingTagId = null;
    editingTagLabel = '';
    tagRenameError = '';
  }

  async function saveTagRename(event: SubmitEvent) {
    event.preventDefault();
    if (!editingTagId) return;

    if (!(await renameTag(editingTagId, editingTagLabel))) {
      tagRenameError = 'Enter a name, or another tag already uses it.';
      return;
    }

    cancelTagRename();
  }

  async function handleImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    const isTextFile =
      file.name.toLowerCase().endsWith('.txt') ||
      file.type === 'text/plain' ||
      file.type === '';

    if (!isTextFile) {
      importFileError = 'Please choose a .txt file.';
      return;
    }

    importFileError = '';

    try {
      importText = await file.text();
      importFileName = file.name;
      importResult = null;
    } catch {
      importFileError = 'Could not read that file.';
      importFileName = '';
    }
  }

  async function handleImport(event: SubmitEvent) {
    event.preventDefault();

    importResult = await importFlashcardRows(parseImportText(importText), importDeckId);
    if (importResult.imported > 0) {
      importText = '';
      importFileName = '';
    }
  }

  function toggleSortDirection() {
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
  }

  function goToPreviousPage() {
    currentPage = Math.max(1, currentPage - 1);
  }

  function goToNextPage() {
    currentPage = Math.min(totalPages, currentPage + 1);
  }

  function handlePageSizeChange() {
    currentPage = 1;
  }
</script>

<ConfirmDialog
  open={confirmAction !== null}
  title={confirmAction?.type === 'clear-deck-cards'
    ? 'Delete all cards in deck?'
    : confirmAction?.type === 'remove-card'
      ? 'Delete card?'
      : confirmAction?.type === 'remove-deck'
        ? 'Remove deck?'
        : 'Remove tag?'}
  message={confirmAction?.type === 'clear-deck-cards'
    ? `Delete all ${confirmAction.count} card${confirmAction.count === 1 ? '' : 's'} in "${confirmAction.deckLabel}"? This cannot be undone.`
    : confirmAction?.type === 'remove-card'
      ? `Delete "${confirmAction.sideA}" → "${confirmAction.sideB}"? This cannot be undone.`
      : confirmAction?.type === 'remove-deck'
        ? `Remove deck "${confirmAction.deckLabel}"? Cards in this deck will become unassigned.`
        : confirmAction?.type === 'remove-tag'
          ? `Remove tag "${confirmAction.tagLabel}"? It will be removed from all cards.`
          : ''}
  confirmLabel={confirmAction?.type === 'clear-deck-cards' || confirmAction?.type === 'remove-card'
    ? 'Delete'
    : 'Remove'}
  onConfirm={handleConfirmAction}
  onCancel={cancelConfirmAction}
/>

{#if flyingCard}
  <div
    class="library-card-fly"
    style="left: {flyingCard.x}px; top: {flyingCard.y}px; opacity: {flyingCard.opacity}; transform: translate(-50%, -50%) scale({flyingCard.scale});"
  >
    <span>{flyingCard.sideA}</span>
    <span aria-hidden="true">→</span>
    <span>{flyingCard.sideB}</span>
  </div>
{/if}

<section class="library-panel library-panel-accent">
  <CollapsibleSection
    symbol="wordList"
    title="Flashcard list"
    description={`${displayCards.length} of ${$flashcards.length} card${$flashcards.length === 1 ? '' : 's'} shown.`}
    bind:open={wordListOpen}
  >
    <div class="library-add-area">
      <div class="library-top-actions">
        <button
          class={addFormOpen ? 'btn-primary' : 'btn-secondary'}
          type="button"
          onclick={toggleAddForm}
        >
          {addFormOpen ? 'Hide add cards' : 'Add cards'}
        </button>
        <button
          class={panelMode === 'delete' ? 'btn-primary' : 'btn-secondary'}
          type="button"
          onclick={toggleDeleteMode}
        >
          Delete cards
        </button>
        {#if panelMode === 'delete'}
          <button
            class="btn-primary"
            type="button"
            disabled={selectedIds.length === 0}
            onclick={handleDeleteSelected}
          >
            Delete selected ({selectedIds.length})
          </button>
        {/if}
      </div>

      <div class="library-add-panel" class:library-add-panel-open={addFormOpen}>
        <div class="library-add-panel__inner">
          <form class="library-add-form" class:library-add-form-saved={addFormSaved} onsubmit={handleAddCard}>
          {#if addError}
            <p class="library-message library-message-error">{addError}</p>
          {/if}

          <div class="library-form-grid">
            <label class="library-field">
              <span class="field-label">Side A</span>
              <input class="field-input" bind:this={wordAInputEl} bind:value={wordA} required />
            </label>
            <label class="library-field">
              <span class="field-label">Side B</span>
              <input class="field-input" bind:value={wordB} required />
            </label>
          </div>

          {#if $decks.length > 0}
            <div class="library-field">
              <span class="field-label">Deck</span>
              <div class="tag-chip-row tag-chip-row-picker">
                {#each $decks as deck (deck.id)}
                  <button
                    class="tag-chip tag-chip-colored tag-chip-deck {addDeckId === deck.id
                      ? 'tag-chip-colored-active'
                      : ''}"
                    type="button"
                    style={tagChipStyles(deck.color, addDeckId === deck.id)}
                    onclick={() => selectAddDeck(deck.id)}
                  >
                    {deck.label}
                  </button>
                {/each}
              </div>
            </div>
          {:else}
            <p class="library-message library-message-error">Create a deck below before adding cards.</p>
          {/if}

          {#if $tags.length > 0}
            <div class="tag-chip-row">
              {#each $tags as tag, index (tag.id)}
                <button
                  class="tag-chip tag-chip-colored {addTagIds.includes(tag.id)
                    ? 'tag-chip-colored-active'
                    : ''}"
                  type="button"
                  style={tagChipStyles(tag.color, addTagIds.includes(tag.id))}
                  onclick={() => toggleAddTag(tag.id)}
                >
                  {index + 1}. {tag.label}
                </button>
              {/each}
            </div>
          {/if}

          <button
            class="btn-primary"
            type="submit"
            disabled={$decks.length === 0}
            bind:this={saveButtonEl}
          >
            Save card
          </button>
          </form>
        </div>
      </div>
    </div>

    <div class="library-list-controls">
      {#if $decks.length > 0}
        <div class="library-sort">
          <label class="library-sort__label" for="deck-filter">Deck</label>
          <select id="deck-filter" class="field-input library-sort__select" bind:value={deckFilter}>
            <option value="all">All decks</option>
            {#each $decks as deck (deck.id)}
              <option value={deck.id}>{deck.label}</option>
            {/each}
            <option value="none">Unassigned</option>
          </select>
        </div>
      {/if}

      <div class="library-sort">
      <label class="library-sort__label" for="sort-field">Sort by</label>
      <select id="sort-field" class="field-input library-sort__select" bind:value={sortField}>
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <button
        class="library-sort__direction"
        type="button"
        aria-label={sortDirection === 'desc' ? 'Sort descending' : 'Sort ascending'}
        title={sortDirection === 'desc' ? 'Descending — click for ascending' : 'Ascending — click for descending'}
        onclick={toggleSortDirection}
      >
        <svg
          class="library-sort__arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          {#if sortDirection === 'desc'}
            <path d="M12 5v14M7 14l5 5 5-5" />
          {:else}
            <path d="M12 19V5M7 10l5-5 5 5" />
          {/if}
        </svg>
      </button>
    </div>
    </div>

    <div class="library-table-wrap" bind:this={tableWrapEl}>
      <div class="library-table-scroll">
    <table class="library-table">
      <thead>
        <tr>
          {#if panelMode === 'delete'}
            <th class="library-table__check"></th>
          {/if}
          <th>#</th>
          <th>Side A</th>
          <th>Side B</th>
          <th>Deck</th>
          <th>Tags</th>
          <th>Times seen</th>
          <th>Star</th>
          <th>Mastered</th>
          <th>Both ways</th>
          <th class="library-table__actions"></th>
        </tr>
      </thead>
      <tbody>
        {#if displayCards.length === 0}
          <tr>
            <td colspan={panelMode === 'delete' ? 11 : 10} class="library-table__empty">
              {#if $flashcards.length === 0}
                No cards yet. Open Add cards above or import a list below.
              {:else}
                No cards match this deck filter.
              {/if}
            </td>
          </tr>
        {:else}
          {#each paginatedCards as card, index (card.id)}
            <tr class:library-row-new={highlightedId === card.id}>
              {#if panelMode === 'delete'}
                <td class="library-table__check">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(card.id)}
                    onchange={() => toggleSelected(card.id)}
                  />
                </td>
              {/if}
              <td class="library-table__index">{pageStart + index + 1}</td>
              <td>{card.sideA}</td>
              <td>{card.sideB}</td>
              <td class="library-table__deck">
                <CardDeckEditor cardId={card.id} deckId={card.deckId} decks={$decks} />
              </td>
              <td class="library-table__tag">
                <CardTagEditor cardId={card.id} tagIds={card.tagIds} tags={$tags} />
              </td>
              <td class="library-table__number">{card.timesSeen}</td>
              <td class="library-table__star">
                <StarIcon variant="regular" filled={card.star} class="h-4 w-4" />
              </td>
              <td class="library-table__star">
                <StarIcon variant="special" filled={card.specialStar} class="h-4 w-4" />
              </td>
              <td class="library-table__star">
                <StarIcon variant="bothWays" filled={card.bothWaysStar} class="h-4 w-4" />
              </td>
              <td class="library-table__actions">
                <button
                  class="tag-list__delete"
                  type="button"
                  onclick={() => requestRemoveCard(card)}
                >
                  Remove
                </button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
      </div>
  </div>

  {#if displayCards.length > 0}
    <div class="library-pagination">
      <p class="library-pagination__info">
        Showing {pageStart + 1}–{pageEnd} of {displayCards.length}
      </p>

      <div class="library-pagination__controls">
        <div class="library-sort">
          <label class="library-sort__label" for="page-size">Per page</label>
          <select
            id="page-size"
            class="field-input library-sort__select"
            bind:value={pageSize}
            onchange={handlePageSizeChange}
          >
            {#each pageSizeOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>

        <div class="library-pagination__nav">
          <button
            class="library-pagination__arrow"
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onclick={goToPreviousPage}
          >
            ←
          </button>
          <span class="library-pagination__status">
            Page {currentPage} of {totalPages}
          </span>
          <button
            class="library-pagination__arrow"
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onclick={goToNextPage}
          >
            →
          </button>
        </div>
      </div>
    </div>
  {/if}
  </CollapsibleSection>
</section>

<section class="library-panel">
  <CollapsibleSection
    symbol="decks"
    title="Decks"
    description="Decks group your flashcards."
    bind:open={decksOpen}
  >
  {#if deckError}
    <p class="library-message library-message-error">{deckError}</p>
  {/if}
  {#if deckRenameError}
    <p class="library-message library-message-error">{deckRenameError}</p>
  {/if}

  <form class="library-inline-form" onsubmit={handleCreateDeck}>
    <input class="field-input" placeholder="Deck name" bind:value={deckLabel} />
    <button class="btn-secondary shrink-0" type="submit">Add deck</button>
  </form>

  {#if $decks.length > 0}
    <ul class="tag-list deck-list">
      {#each $decks as deck, index (deck.id)}
        <li class="tag-list__item deck-list__item" style="border-color: color-mix(in srgb, {deck.color} 30%, transparent);">
          <span class="deck-list__index" style={deckIndexStyle(deck.color)}>{index + 1}</span>
          {#if editingDeckId === deck.id}
            <form class="tag-list__rename" onsubmit={saveDeckRename}>
              <input
                class="field-input tag-list__rename-input"
                bind:this={deckRenameInputEl}
                bind:value={editingDeckLabel}
                required
              />
              <div class="tag-list__actions">
                <button class="tag-list__delete" type="submit">Save</button>
                <button class="tag-list__delete" type="button" onclick={cancelDeckRename}>Cancel</button>
              </div>
            </form>
          {:else}
            <span class="tag-list__label" style="color: {deck.color}">{deck.label}</span>
            <span class="tag-list__meta">{deckCardCount(deck.id)} cards</span>
            <div class="tag-list__actions">
              <button
                class="tag-list__delete"
                type="button"
                onclick={() => startRenameDeck(deck.id, deck.label)}
              >
                Rename
              </button>
              <button
                class="tag-list__delete"
                type="button"
                disabled={deckCardCount(deck.id) === 0}
                onclick={() =>
                  requestClearDeckCards(deck.id, deck.label, deckCardCount(deck.id))}
              >
                Clear cards
              </button>
              <button
                class="tag-list__delete"
                type="button"
                onclick={() => requestRemoveDeck(deck.id, deck.label)}
              >
                Remove
              </button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  </CollapsibleSection>
</section>

<section class="library-panel">
  <CollapsibleSection
    symbol="tags"
    title="Tags"
    description="Tags label cards within a deck."
    bind:open={tagsOpen}
  >
  {#if tagError}
    <p class="library-message library-message-error">{tagError}</p>
  {/if}
  {#if tagRenameError}
    <p class="library-message library-message-error">{tagRenameError}</p>
  {/if}

  <form class="library-inline-form" onsubmit={handleCreateTag}>
    <input class="field-input" placeholder="Tag name" bind:value={tagLabel} />
    <button class="btn-secondary shrink-0" type="submit">Add tag</button>
  </form>

  {#if $tags.length > 0}
    <ul class="tag-list tag-list-compact">
      {#each $tags as tag, index (tag.id)}
        <li class="tag-list__item" style="border-color: color-mix(in srgb, {tag.color} 30%, transparent);">
          <span class="tag-list__index" style={tagDotStyle(tag.color)}>{index + 1}</span>
          {#if editingTagId === tag.id}
            <form class="tag-list__rename" onsubmit={saveTagRename}>
              <input
                class="field-input tag-list__rename-input"
                bind:this={tagRenameInputEl}
                bind:value={editingTagLabel}
                required
              />
              <button class="tag-list__delete" type="submit">Save</button>
              <button class="tag-list__delete" type="button" onclick={cancelTagRename}>Cancel</button>
            </form>
          {:else}
            <span class="tag-list__label" style="color: {tag.color}">{tag.label}</span>
            <button
              class="tag-list__delete"
              type="button"
              onclick={() => startRenameTag(tag.id, tag.label)}
            >
              Rename
            </button>
            <button
              class="tag-list__delete"
              type="button"
              onclick={() => requestRemoveTag(tag.id, tag.label)}
            >
              Remove
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  </CollapsibleSection>
</section>

<section class="library-panel">
  <CollapsibleSection symbol="import" title="Import cards" bind:open={importOpen}>
    <form class="space-y-4" onsubmit={handleImport}>
      <div class="library-field">
        <span class="field-label">Assign to deck</span>
        <div class="tag-chip-row tag-chip-row-picker">
          <button
            class="tag-chip tag-chip-no-deck {importDeckId === null ? 'tag-chip-no-deck-active' : ''}"
            type="button"
            onclick={() => (importDeckId = null)}
          >
            No deck
          </button>
          {#each $decks as deck (deck.id)}
            <button
              class="tag-chip tag-chip-colored tag-chip-deck {importDeckId === deck.id
                ? 'tag-chip-colored-active'
                : ''}"
              type="button"
              style={tagChipStyles(deck.color, importDeckId === deck.id)}
              onclick={() => (importDeckId = deck.id)}
            >
              {deck.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="import-file-row">
        <label class="import-file-picker">
          <span class="btn-secondary">Choose .txt file</span>
          <input
            class="import-file-input"
            type="file"
            accept=".txt,text/plain"
            onchange={handleImportFile}
          />
        </label>
        {#if importFileName}
          <span class="import-file-name">{importFileName}</span>
        {/if}
      </div>

      {#if importFileError}
        <p class="library-message library-message-error">{importFileError}</p>
      {/if}

      <p class="text-sm text-muted">
        One card per line: <code class="library-code">wordA,wordB</code> or
        <code class="library-code">wordA,wordB,tag1;tag2;tag3</code>
      </p>
      <textarea
        class="field-input min-h-36 resize-y font-mono text-sm"
        placeholder={"hello,hola\nworld,wereld,basics;chapter1"}
        bind:value={importText}
      ></textarea>
      <button class="btn-primary" type="submit" disabled={!importText.trim()}>
        Run import
      </button>

      {#if importResult}
        <p
          class="library-message {importResult.imported > 0
            ? 'library-message-success'
            : 'library-message-error'}"
        >
          {#if importResult.errors.length > 0}
            {importResult.errors[0]}
          {:else}
            Imported {importResult.imported} card{importResult.imported === 1 ? '' : 's'}.
            {#if importResult.skipped > 0}
              Skipped {importResult.skipped}.
            {/if}
          {/if}
        </p>
      {/if}
    </form>
  </CollapsibleSection>
</section>
