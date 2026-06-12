<script lang="ts">
  import type { Deck } from '$lib/stores/decks';
  import type { Tag } from '$lib/stores/tags';
  import {
    deckFilterLabel,
    directionLabel,
    formatExerciseDuration,
    formatPerFlashcardDuration,
    quizModeLabel,
    sessionCompleteCopy,
    type ExerciseSettings
  } from '$lib/utils/exercise';

  let {
    settings,
    sessionLength,
    correctCount,
    wrongCount,
    skipCount,
    peekCount,
    sessionDurationMs,
    cardsTimed,
    answerOutcomes,
    endedEarly,
    decks = [],
    tags = [],
    onTryAgain,
    onTryNew,
    onDashboard
  }: {
    settings: ExerciseSettings;
    sessionLength: number;
    correctCount: number;
    wrongCount: number;
    skipCount: number;
    peekCount: number;
    sessionDurationMs: number;
    cardsTimed: number;
    answerOutcomes: Array<'correct' | 'wrong'>;
    endedEarly: boolean;
    decks?: Deck[];
    tags?: Tag[];
    onTryAgain: () => void;
    onTryNew: () => void;
    onDashboard: () => void;
  } = $props();

  let cardsGraded = $derived(correctCount + wrongCount);
  let cardsCompleted = $derived(answerOutcomes.length);
  let remainingCount = $derived(Math.max(sessionLength - cardsCompleted, 0));
  let accuracy = $derived(cardsGraded > 0 ? Math.round((correctCount / cardsGraded) * 100) : null);
  let showPeekingMetric = $derived(settings.allowPeeking);

  let copy = $derived(
    sessionCompleteCopy(accuracy, endedEarly, cardsGraded, cardsCompleted, sessionLength)
  );

  let chartMax = $derived(
    Math.max(correctCount, wrongCount, skipCount, showPeekingMetric ? peekCount : 0, 1)
  );

  let chartBars = $derived([
    { key: 'correct', label: 'Correct', value: correctCount, tone: 'correct' as const },
    { key: 'wrong', label: 'Wrong', value: wrongCount, tone: 'wrong' as const },
    { key: 'skipped', label: 'Skipped', value: skipCount, tone: 'skipped' as const },
    ...(showPeekingMetric
      ? [{ key: 'peek', label: 'Peeking', value: peekCount, tone: 'peek' as const }]
      : [])
  ]);

  let hasChartData = $derived(
    cardsGraded > 0 || skipCount > 0 || (showPeekingMetric && peekCount > 0)
  );

  let selectedTagLabels = $derived(
    settings.tagIds
      .map((tagId) => tags.find((tag) => tag.id === tagId)?.label)
      .filter((label): label is string => Boolean(label))
  );

  let sessionDetails = $derived([
    quizModeLabel(settings.quizMode),
    directionLabel(settings.direction),
    deckFilterLabel(settings.deckId, decks),
    settings.allowPeeking ? 'Peeking on' : 'Peeking off',
    ...(selectedTagLabels.length > 0
      ? [`${selectedTagLabels.length} tag${selectedTagLabels.length === 1 ? '' : 's'}`]
      : [])
  ]);

  let durationLabel = $derived(formatExerciseDuration(sessionDurationMs));
  let paceLabel = $derived(formatPerFlashcardDuration(sessionDurationMs, cardsTimed));
</script>

<section class="exercise-complete glass-panel">
  <div class="exercise-complete__hero">
    <div class="exercise-complete__intro">
      <p class="exercise-complete__eyebrow">
        {endedEarly ? 'Session report' : 'Session complete'}
      </p>
      <h2 class="exercise-complete__title">{copy.headline}</h2>
      <p class="exercise-complete__message">{copy.message}</p>
    </div>

    {#if accuracy !== null}
      <div
        class="exercise-complete__accuracy"
        class:exercise-complete__accuracy-strong={accuracy >= 75}
        class:exercise-complete__accuracy-mid={accuracy >= 40 && accuracy < 75}
        class:exercise-complete__accuracy-low={accuracy < 40}
      >
        <span class="exercise-complete__accuracy-value">{accuracy}%</span>
        <span class="exercise-complete__accuracy-label">Accuracy</span>
      </div>
    {/if}
  </div>

  <div class="exercise-complete__timing">
    <article class="exercise-complete__timing-item">
      <span class="exercise-complete__timing-label">Exercise completed in</span>
      <span class="exercise-complete__timing-value">{durationLabel}</span>
    </article>
    <article class="exercise-complete__timing-item">
      <span class="exercise-complete__timing-label">Average pace</span>
      <span class="exercise-complete__timing-value">{paceLabel} per flashcard</span>
    </article>
  </div>

  <div class="exercise-complete__chart-panel">
    <div class="exercise-complete__chart-head">
      <span class="field-label">Score breakdown</span>
      <span class="exercise-complete__chart-meta">
        {#if endedEarly}
          {cardsCompleted} of {sessionLength} flashcards
          {#if remainingCount > 0}
            · {remainingCount} not reached
          {/if}
        {:else}
          {sessionLength} flashcard{sessionLength === 1 ? '' : 's'} in session
        {/if}
      </span>
    </div>

    {#if !hasChartData}
      <p class="exercise-complete__chart-empty">No graded answers yet — run the exercise to see your chart.</p>
    {:else}
      <div
        class="exercise-complete__chart"
        role="img"
        aria-label="Bar chart of correct, wrong, skipped{showPeekingMetric ? ', and peeking' : ''} counts"
      >
        <div
          class="exercise-complete__chart-bars"
          class:exercise-complete__chart-bars-wide={showPeekingMetric}
        >
          {#each chartBars as bar (bar.key)}
            <div class="exercise-complete__chart-column">
              <span class="exercise-complete__chart-value">{bar.value}</span>
              <div class="exercise-complete__chart-bar-track">
                <div
                  class="exercise-complete__chart-bar exercise-complete__chart-bar-{bar.tone}"
                  style="height: {(bar.value / chartMax) * 100}%"
                ></div>
              </div>
              <span class="exercise-complete__chart-label">{bar.label}</span>
            </div>
          {/each}
        </div>
      </div>

      <div
        class="exercise-complete__chart-summary"
        class:exercise-complete__chart-summary-wide={showPeekingMetric}
      >
        {#each chartBars as bar (bar.key)}
          <div class="exercise-complete__summary-item exercise-complete__summary-item-{bar.tone}">
            <span class="exercise-complete__summary-value">{bar.value}</span>
            <span class="exercise-complete__summary-label">{bar.label}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="exercise-complete__details">
    <span class="field-label">Session setup</span>
    <div class="exercise-complete__detail-chips">
      {#each sessionDetails as detail (detail)}
        <span class="exercise-complete__detail-chip">{detail}</span>
      {/each}
    </div>
    {#if selectedTagLabels.length > 0}
      <p class="exercise-complete__tag-list">{selectedTagLabels.join(' · ')}</p>
    {/if}
  </div>

  <div class="exercise-complete__actions">
    <button class="btn-primary exercise-complete__action-primary" type="button" onclick={onTryAgain}>
      Try same exercise again
    </button>
    <div class="exercise-complete__action-row">
      <button class="btn-secondary" type="button" onclick={onTryNew}>Try new exercise</button>
      <button class="btn-secondary" type="button" onclick={onDashboard}>Back to dashboard</button>
    </div>
  </div>
</section>
