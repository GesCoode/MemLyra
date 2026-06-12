<script lang="ts">
  import type { Deck } from '$lib/stores/decks';
  import type { Flashcard } from '$lib/stores/flashcards';
  import type { Tag } from '$lib/stores/tags';
  import {
    buildExerciseSession,
    filterFlashcards,
    type ExerciseDirection,
    type ExerciseSettings,
    type QuizMode,
    type SessionCard
  } from '$lib/utils/exercise';
  import { tagChipStyles } from '$lib/utils/tagColors';

  let {
    cards,
    decks,
    tags,
    onStart
  }: {
    cards: Flashcard[];
    decks: Deck[];
    tags: Tag[];
    onStart: (session: SessionCard[], settings: ExerciseSettings) => void;
  } = $props();

  let deckId = $state<string | 'all' | 'none'>('all');
  let selectedTagIds = $state<string[]>([]);
  let includeKnown = $state(false);
  let includeMastered = $state(false);
  let allowPeeking = $state(false);
  let cardCount = $state(20);
  let useMax = $state(false);
  let direction = $state<ExerciseDirection>('aToB');
  let quizMode = $state<QuizMode>('type');

  let settings = $derived<ExerciseSettings>({
    deckId,
    tagIds: selectedTagIds,
    includeKnown,
    includeMastered,
    allowPeeking,
    cardCount: useMax ? 'max' : cardCount,
    direction,
    quizMode
  });

  let matchingCount = $derived(filterFlashcards(cards, settings).length);
  let sessionCount = $derived(
    useMax ? matchingCount : Math.min(cardCount, matchingCount)
  );
  let allTagsSelected = $derived(
    tags.length > 0 && tags.every((tag) => selectedTagIds.includes(tag.id))
  );

  function toggleTag(tagId: string) {
    selectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
  }

  function toggleAllTags() {
    selectedTagIds = allTagsSelected ? [] : tags.map((tag) => tag.id);
  }

  function setMax() {
    useMax = true;
    cardCount = Math.max(matchingCount, 1);
  }

  function handleCountInput(event: Event) {
    useMax = false;
    const value = Number((event.currentTarget as HTMLInputElement).value);
    cardCount = Number.isFinite(value) ? Math.max(1, value) : 1;
  }

  function toggleIncludeKnown() {
    if (includeMastered) return;
    includeKnown = !includeKnown;
  }

  function toggleIncludeMastered() {
    includeMastered = !includeMastered;
    if (includeMastered) includeKnown = true;
  }

  function startExercise() {
    const session = buildExerciseSession(cards, settings);
    if (session.length === 0) return;
    onStart(session, settings);
  }

  const directionOptions: { value: ExerciseDirection; label: string }[] = [
    { value: 'aToB', label: 'A → B' },
    { value: 'bToA', label: 'B → A' },
    { value: 'both', label: 'Both ways' }
  ];

  const quizOptions: {
    value: QuizMode;
    label: string;
    desc: string;
    icon: 'type' | 'multipleChoice' | 'selfGrade' | 'anki';
  }[] = [
    {
      value: 'type',
      label: 'Type answer',
      desc: 'Type the translation and get scored',
      icon: 'type'
    },
    {
      value: 'multipleChoice',
      label: 'Multiple choice',
      desc: 'Pick the correct option from three',
      icon: 'multipleChoice'
    },
    {
      value: 'selfGrade',
      label: 'Self grade',
      desc: 'Flip the card, then mark correct or wrong',
      icon: 'selfGrade'
    },
    {
      value: 'anki',
      label: 'Anki style',
      desc: 'Flip the card, then rate Again, Good, or Easy',
      icon: 'anki'
    }
  ];
</script>

<div class="exercise-setup glass-panel">
  <div class="exercise-setup__main">
    <div class="exercise-setup__section">
      <span class="field-label">Deck</span>
      <div class="tag-chip-row tag-chip-row-picker">
        <button
          class="tag-chip tag-chip-no-deck {deckId === 'all' ? 'tag-chip-no-deck-active' : ''}"
          type="button"
          onclick={() => (deckId = 'all')}
        >
          All decks
        </button>
        {#if decks.length > 0}
          <button
            class="tag-chip tag-chip-no-deck {deckId === 'none' ? 'tag-chip-no-deck-active' : ''}"
            type="button"
            onclick={() => (deckId = 'none')}
          >
            Unassigned
          </button>
          {#each decks as deck (deck.id)}
            <button
              class="tag-chip tag-chip-colored tag-chip-deck {deckId === deck.id
                ? 'tag-chip-colored-active'
                : ''}"
              type="button"
              style={tagChipStyles(deck.color, deckId === deck.id)}
              onclick={() => (deckId = deck.id)}
            >
              {deck.label}
            </button>
          {/each}
        {/if}
      </div>
    </div>

    {#if tags.length > 0}
      <div class="exercise-setup__section">
        <div class="exercise-setup__inline-label">
          <span class="field-label">Tags</span>
          <button class="exercise-setup__mini-btn" type="button" onclick={toggleAllTags}>
            {allTagsSelected ? 'Deselect all tags' : 'Add all tags'}
          </button>
        </div>
        <div class="tag-chip-row tag-chip-row-picker">
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

    <div class="exercise-setup__section">
      <span class="field-label">Flashcard pool</span>
      <div class="exercise-filter-toggles">
        <button
          class="exercise-filter-toggle"
          class:exercise-filter-toggle-active={includeKnown}
          class:exercise-filter-toggle-locked={includeMastered}
          type="button"
          aria-pressed={includeKnown}
          onclick={toggleIncludeKnown}
        >
          <span class="exercise-filter-toggle__icon exercise-filter-toggle__icon-known" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
              />
            </svg>
          </span>
          <span class="exercise-filter-toggle__body">
            <span class="exercise-filter-toggle__title">Include known flashcards</span>
            <span class="exercise-filter-toggle__desc">Cards you already earned a learned star for</span>
          </span>
          <span class="exercise-filter-toggle__switch" aria-hidden="true"></span>
        </button>

        <button
          class="exercise-filter-toggle"
          class:exercise-filter-toggle-active={includeMastered}
          type="button"
          aria-pressed={includeMastered}
          onclick={toggleIncludeMastered}
        >
          <span class="exercise-filter-toggle__icon exercise-filter-toggle__icon-mastered" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 1.8l2.9 6.6 7.1.7-5.4 4.7 1.7 7L12 17.2 5.7 20.8l1.7-7L2 9.1l7.1-.7L12 1.8z"
              />
              <circle cx="12" cy="12" r="3.2" fill="#0d1424" />
            </svg>
          </span>
          <span class="exercise-filter-toggle__body">
            <span class="exercise-filter-toggle__title">Include mastered flashcards</span>
            <span class="exercise-filter-toggle__desc">Cards you marked as fully mastered</span>
          </span>
          <span class="exercise-filter-toggle__switch" aria-hidden="true"></span>
        </button>

        <button
          class="exercise-filter-toggle"
          class:exercise-filter-toggle-active={allowPeeking}
          type="button"
          aria-pressed={allowPeeking}
          onclick={() => (allowPeeking = !allowPeeking)}
        >
          <span class="exercise-filter-toggle__icon exercise-filter-toggle__icon-peek" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path
                d="M2.5 12.5s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="12.5" r="2.75" />
            </svg>
          </span>
          <span class="exercise-filter-toggle__body">
            <span class="exercise-filter-toggle__title">Allow peeking</span>
            <span class="exercise-filter-toggle__desc">Flip the card to preview the answer before responding</span>
          </span>
          <span class="exercise-filter-toggle__switch" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <div class="exercise-setup__section">
      <span class="field-label">Cards in session</span>
      <div class="exercise-setup__count-row">
        <input
          class="field-input exercise-setup__count-input"
          type="number"
          min="1"
          value={useMax ? matchingCount : cardCount}
          disabled={useMax}
          oninput={handleCountInput}
        />
        <button
          class="btn-secondary shrink-0"
          type="button"
          class:btn-primary={useMax}
          onclick={setMax}
        >
          Max ({matchingCount})
        </button>
      </div>
      {#if useMax}
        <p class="exercise-setup__hint">
          All flashcards matching the current filter will be shuffled into the session.
        </p>
      {/if}
    </div>

    <div class="exercise-setup__section">
      <span class="field-label">Direction</span>
      <div class="exercise-option-row">
        {#each directionOptions as option}
          <button
            class="exercise-option {direction === option.value ? 'exercise-option-active' : ''}"
            type="button"
            onclick={() => (direction = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="exercise-setup__section">
      <span class="field-label">How to quiz</span>
      <div class="exercise-quiz-grid">
        {#each quizOptions as option}
          <button
            class="exercise-quiz-option exercise-quiz-option-{option.icon} {quizMode === option.value
              ? 'exercise-quiz-option-active'
              : ''}"
            type="button"
            onclick={() => (quizMode = option.value)}
          >
            <span class="exercise-quiz-option__icon" aria-hidden="true">
              {#if option.icon === 'type'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M7 15h6M7 11h10" stroke-linecap="round" />
                </svg>
              {:else if option.icon === 'multipleChoice'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <rect x="4" y="5" width="16" height="4" rx="1" />
                  <rect x="4" y="11" width="16" height="4" rx="1" />
                  <rect x="4" y="17" width="16" height="2" rx="1" />
                  <path d="m8 7 1.5 1.5L11 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              {:else if option.icon === 'selfGrade'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M9 12h6M12 9v6" stroke-linecap="round" />
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <rect x="3" y="8" width="13" height="11" rx="1.5" />
                  <path d="M7 4h13v11" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              {/if}
            </span>
            <span class="exercise-quiz-option__content">
              <span class="exercise-quiz-option__label">{option.label}</span>
              <span class="exercise-quiz-option__desc">{option.desc}</span>
            </span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="exercise-setup__footer">
    <div class="exercise-setup__footer-actions">
      <p class="exercise-setup__match-count">
        {sessionCount} flashcard{sessionCount === 1 ? '' : 's'} in this exercise
      </p>
      <button class="btn-primary shrink-0" type="button" disabled={sessionCount === 0} onclick={startExercise}>
        Start exercise
      </button>
    </div>
  </div>
</div>
