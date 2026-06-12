<script lang="ts">
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import type { Deck } from '$lib/stores/decks';
  import type { Flashcard } from '$lib/stores/flashcards';
  import type { Tag } from '$lib/stores/tags';
  import { tagChipStyles } from '$lib/utils/tagColors';

  let {
    cards,
    decks,
    tags
  }: {
    cards: Flashcard[];
    decks: Deck[];
    tags: Tag[];
  } = $props();

  let deckFilter = $state<string>('all');
  let selectedTagIds = $state<string[]>([]);
  let pageSize = $state(20);
  let currentPage = $state(1);

  const pageSizeOptions = [20, 50, 100];

  let allTagsSelected = $derived(
    tags.length > 0 && tags.every((tag) => selectedTagIds.includes(tag.id))
  );

  let filteredCards = $derived(
    cards.filter((card) => {
      if (deckFilter === 'none') {
        if (card.deckId) return false;
      } else if (deckFilter !== 'all' && card.deckId !== deckFilter) {
        return false;
      }

      if (selectedTagIds.length > 0) {
        const hasTag = selectedTagIds.some((tagId) => card.tagIds.includes(tagId));
        if (!hasTag) return false;
      }

      return true;
    })
  );

  let totalPages = $derived(Math.max(1, Math.ceil(filteredCards.length / pageSize)));
  let pageStart = $derived((currentPage - 1) * pageSize);
  let paginatedCards = $derived(filteredCards.slice(pageStart, pageStart + pageSize));
  let pageEnd = $derived(Math.min(pageStart + pageSize, filteredCards.length));

  $effect(() => {
    deckFilter;
    selectedTagIds;
    currentPage = 1;
  });

  $effect(() => {
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
  });

  function toggleTag(tagId: string) {
    selectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
  }

  function toggleAllTags() {
    selectedTagIds = allTagsSelected ? [] : tags.map((tag) => tag.id);
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

<div class="learned-words-section">
  <h2 class="learned-words-section__title">Learned flashcards</h2>

  <div class="library-list-controls">
    <div class="library-sort">
      <label class="library-sort__label" for="learned-deck-filter">Deck</label>
      <select id="learned-deck-filter" class="field-input library-sort__select" bind:value={deckFilter}>
        <option value="all">All decks</option>
        {#each decks as deck (deck.id)}
          <option value={deck.id}>{deck.label}</option>
        {/each}
        <option value="none">Unassigned</option>
      </select>
    </div>

    {#if tags.length > 0}
      <div class="library-sort learned-words-section__tag-filter">
        <span class="library-sort__label" id="learned-tag-filter-label">Tags</span>
        <div class="tag-chip-row tag-chip-row-picker" aria-labelledby="learned-tag-filter-label">
          <button
            class="tag-chip tag-chip-no-deck {selectedTagIds.length === 0
              ? 'tag-chip-no-deck-active'
              : ''}"
            type="button"
            onclick={() => (selectedTagIds = [])}
          >
            All tags
          </button>
          <button class="exercise-setup__mini-btn" type="button" onclick={toggleAllTags}>
            {allTagsSelected ? 'Deselect all tags' : 'Add all tags'}
          </button>
          {#each tags as tag (tag.id)}
            <button
              class="tag-chip tag-chip-colored {selectedTagIds.includes(tag.id)
                ? 'tag-chip-colored-active'
                : ''}"
              type="button"
              style={tagChipStyles(tag.color, selectedTagIds.includes(tag.id))}
              onclick={() => toggleTag(tag.id)}
            >
              {tag.label}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if filteredCards.length === 0}
    <p class="learned-words-section__empty">No learned flashcards match these filters.</p>
  {:else}
    <ul class="learned-words-section__list">
      {#each paginatedCards as card (card.id)}
        <li class="learned-words-section__item">
          <div class="learned-words-section__pair">
            <span class="learned-words-section__word">{card.sideA}</span>
            <span class="learned-words-section__arrow" aria-hidden="true">→</span>
            <span class="learned-words-section__word">{card.sideB}</span>
          </div>

          <div class="learned-words-section__badges">
            {#if card.bothWaysStar}
              <span class="learned-words-section__badge learned-words-section__badge-bothways">
                <StarIcon variant="bothWays" class="h-4 w-4" />
                Both ways
              </span>
            {/if}
            {#if card.specialStar}
              <span class="learned-words-section__badge learned-words-section__badge-mastered">
                <StarIcon variant="special" class="h-4 w-4" />
                Mastered
              </span>
            {/if}
            {#if card.star}
              <span class="learned-words-section__badge learned-words-section__badge-learned">
                <StarIcon variant="regular" class="h-4 w-4" />
                Learned
              </span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>

    <div class="library-pagination">
      <p class="library-pagination__info">
        Showing {pageStart + 1}–{pageEnd} of {filteredCards.length}
      </p>

      <div class="library-pagination__controls">
        <div class="library-sort">
          <label class="library-sort__label" for="learned-page-size">Per page</label>
          <select
            id="learned-page-size"
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
</div>
