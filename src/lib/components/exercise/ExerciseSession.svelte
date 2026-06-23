<script lang="ts">
  import { browser } from '$app/environment';
  import { tick } from 'svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import ExerciseComplete from '$lib/components/exercise/ExerciseComplete.svelte';
  import FlashcardStage from '$lib/components/exercise/FlashcardStage.svelte';
  import type { Deck } from '$lib/stores/decks';
  import type { Flashcard } from '$lib/stores/flashcards';
  import type { Tag } from '$lib/stores/tags';
  import { exerciseSessionActive } from '$lib/stores/exerciseUi';
  import { recordExerciseResult, recordExerciseSeen } from '$lib/stores/flashcards';
  import { filterFlashcards } from '$lib/utils/exercise';
  import {
    buildMultipleChoiceOptions,
    type ExerciseSettings,
    type QuizMode,
    type SessionCard
  } from '$lib/utils/exercise';
  import { scoreGuess } from '$lib/utils/scoreGuess';

  type AnswerOutcome = 'correct' | 'wrong' | 'pending';

  let {
    session,
    settings,
    pool,
    decks = [],
    tags = [],
    exitLabel = 'Back to dashboard',
    onExit,
    onTryAgain,
    onDashboard
  }: {
    session: SessionCard[];
    settings: ExerciseSettings;
    pool: Flashcard[];
    decks?: Deck[];
    tags?: Tag[];
    exitLabel?: string;
    onExit: () => void;
    onTryAgain: () => void;
    onDashboard: () => void;
  } = $props();

  const startingSession = session;
  const CARD_FLIP_MS = 650;
  let filteredPool = $derived(filterFlashcards(pool, settings));

  let queue = $state<SessionCard[]>(startingSession.map((card) => card));
  let currentIndex = $state(0);
  let gradedSessionIds = $state<Set<string>>(new Set());
  let flipped = $state(false);
  let entering = $state(false);
  let typedAnswer = $state('');
  let showResult = $state(false);
  let lastPercent = $state<number | null>(null);
  let lastCorrect = $state<boolean | null>(null);
  let selectedChoice = $state<string | null>(null);
  let correctCount = $state(0);
  let wrongCount = $state(0);
  let hideProgress = $state(false);
  let hideCounter = $state(false);
  let finished = $state(false);
  let endedEarly = $state(false);
  let answerInput = $state<HTMLInputElement | null>(null);
  let confirmEmptySkip = $state(false);
  let confirmEndQuiz = $state(false);
  let answerOutcomes = $state<AnswerOutcome[]>([]);
  let skipCount = $state(0);
  let reportSkipCount = $state(0);
  let peekCount = $state(0);
  let cardsShown = $state(1);
  let revealingAnswer = $state(false);
  const sessionStartedAt = Date.now();
  let sessionDurationMs = $state(0);

  let answerRevealedForGrade = $state(false);
  let isPeeking = $derived(
    settings.allowPeeking && flipped && !showResult && !answerRevealedForGrade
  );
  let canPeek = $derived(
    settings.allowPeeking &&
      !showResult &&
      !answerRevealedForGrade &&
      (settings.quizMode === 'type' ||
        settings.quizMode === 'multipleChoice' ||
        settings.quizMode === 'selfGrade' ||
        settings.quizMode === 'anki')
  );

  let currentCard = $derived(queue[currentIndex]);
  let segmentWidth = $derived(queue.length > 0 ? 100 / queue.length : 0);
  let mcOptions = $derived(
    currentCard ? buildMultipleChoiceOptions(currentCard, pool, queue) : []
  );
  let gradedOutcomes = $derived(
    answerOutcomes.filter((outcome): outcome is 'correct' | 'wrong' => outcome !== 'pending')
  );

  function resetCardState() {
    flipped = false;
    answerRevealedForGrade = false;
    typedAnswer = '';
    showResult = false;
    revealingAnswer = false;
    lastPercent = null;
    lastCorrect = null;
    selectedChoice = null;
    confirmEmptySkip = false;
  }

  function allCardsGraded(): boolean {
    return queue.every((card) => gradedSessionIds.has(card.id));
  }

  function advanceToNextCard() {
    for (let step = 1; step <= queue.length; step += 1) {
      const nextIndex = (currentIndex + step) % queue.length;
      if (!gradedSessionIds.has(queue[nextIndex].id)) {
        entering = true;
        resetCardState();
        currentIndex = nextIndex;
        cardsShown += 1;

        window.setTimeout(() => {
          entering = false;
        }, 420);
        return;
      }
    }

    finishSession();
  }

  function finishSession() {
    if (finished) return;
    reportSkipCount = skipCount;
    sessionDurationMs = Date.now() - sessionStartedAt;
    finished = true;
  }

  function recordOutcome(correct: boolean) {
    if (!currentCard || gradedSessionIds.has(currentCard.id)) return;

    answerOutcomes.push(correct ? 'correct' : 'wrong');
    gradedSessionIds = new Set(gradedSessionIds).add(currentCard.id);
    if (correct) correctCount += 1;
    else wrongCount += 1;
  }

  function markCurrentCardPending() {
    if (!currentCard || gradedSessionIds.has(currentCard.id)) return;
    if (answerOutcomes.at(-1) === 'pending') return;

    answerOutcomes.push('pending');
  }

  function resolvePendingOutcome(correct: boolean) {
    if (!currentCard) return;

    const lastOutcome = answerOutcomes.at(-1);
    if (lastOutcome === 'pending') {
      answerOutcomes[answerOutcomes.length - 1] = correct ? 'correct' : 'wrong';
    } else if (!gradedSessionIds.has(currentCard.id)) {
      answerOutcomes.push(correct ? 'correct' : 'wrong');
    }

    if (!gradedSessionIds.has(currentCard.id)) {
      gradedSessionIds = new Set(gradedSessionIds).add(currentCard.id);
      if (correct) correctCount += 1;
      else wrongCount += 1;
    }
  }

  function removePendingOutcomeIfPresent() {
    if (answerOutcomes.at(-1) === 'pending') {
      answerOutcomes.pop();
    }
  }

  function recordAndAdvance(correct: boolean) {
    if (!currentCard) return;

    if (!gradedSessionIds.has(currentCard.id)) {
      recordOutcome(correct);
    }

    void recordExerciseResult(currentCard.cardId, correct, currentCard.direction);

    if (allCardsGraded()) {
      finishSession();
      return;
    }

    advanceToNextCard();
  }

  function flipCard() {
    if (finished || showResult) return;
    if (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice') return;

    answerRevealedForGrade = true;
    markCurrentCardPending();
    flipped = true;
  }

  function togglePeek() {
    if (!canPeek) return;
    if (!flipped) peekCount += 1;
    flipped = !flipped;
  }

  function handleCardInteraction() {
    if (finished || !currentCard) return;

    if (
      showResult &&
      (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice')
    ) {
      nextFromResult();
      return;
    }

    if (
      !showResult &&
      !flipped &&
      (settings.quizMode === 'selfGrade' || settings.quizMode === 'anki')
    ) {
      flipCard();
    }
  }

  let cardInteractive = $derived(
    (showResult && (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice')) ||
      (!showResult &&
        !flipped &&
        (settings.quizMode === 'selfGrade' || settings.quizMode === 'anki'))
  );

  async function revealWithFlip(correct: boolean, percent: number | null) {
    if (!currentCard || showResult || revealingAnswer) return;

    revealingAnswer = true;
    lastCorrect = correct;
    lastPercent = percent;
    recordOutcome(correct);
    flipped = true;

    await new Promise((resolve) => setTimeout(resolve, CARD_FLIP_MS));

    if (currentCard) {
      showResult = true;
    }

    revealingAnswer = false;
  }

  function submitTypedAnswer() {
    if (!currentCard || showResult || revealingAnswer) return;

    if (!typedAnswer.trim()) {
      if (!confirmEmptySkip) {
        confirmEmptySkip = true;
        return;
      }

      confirmEmptySkip = false;
      deferCard();
      return;
    }

    confirmEmptySkip = false;
    const result = scoreGuess(typedAnswer, currentCard.answer);
    void revealWithFlip(result.isCorrect, result.percent);
  }

  function handleTypedAnswerInput() {
    if (canPeek && flipped && typedAnswer.trim().length > 0) {
      flipped = false;
    }

    if (confirmEmptySkip && typedAnswer.trim()) {
      confirmEmptySkip = false;
    }
  }

  function pickChoice(choice: string) {
    if (!currentCard || showResult || revealingAnswer) return;
    selectedChoice = choice;
    const correct = choice.trim() === currentCard.answer.trim();
    void revealWithFlip(correct, correct ? 100 : 0);
  }

  function gradeSelf(correct: boolean) {
    if (!currentCard) return;

    resolvePendingOutcome(correct);
    void recordExerciseResult(currentCard.cardId, correct, currentCard.direction);

    if (allCardsGraded()) {
      finishSession();
      return;
    }

    advanceToNextCard();
  }

  function gradeAnki(level: 'again' | 'good' | 'easy') {
    gradeSelf(level !== 'again');
  }

  function nextFromResult() {
    if (!showResult || lastCorrect === null) return;
    recordAndAdvance(lastCorrect);
  }

  function tryAgainLaterFromResult() {
    if (!showResult || !currentCard || lastCorrect !== false) return;

    skipCount += 1;
    const card = queue[currentIndex];
    queue = [...queue.slice(0, currentIndex), ...queue.slice(currentIndex + 1), card];

    entering = true;
    resetCardState();
    cardsShown += 1;

    window.setTimeout(() => {
      entering = false;
    }, 420);
  }

  function skipWithoutGrade() {
    removePendingOutcomeIfPresent();
    deferCard();
  }

  function deferCard() {
    if (finished || !currentCard || showResult) return;

    skipCount += 1;
    const card = queue[currentIndex];
    queue = [...queue.slice(0, currentIndex), ...queue.slice(currentIndex + 1), card];

    entering = true;
    resetCardState();
    cardsShown += 1;

    window.setTimeout(() => {
      entering = false;
    }, 420);
  }

  function endQuiz() {
    if (finished) return;
    endedEarly = true;
    reportSkipCount = skipCount;
    sessionDurationMs = Date.now() - sessionStartedAt;
    finished = true;
    confirmEndQuiz = false;
  }

  function requestEndQuiz() {
    confirmEndQuiz = true;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (finished || event.key !== 'Enter') return;
    if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) {
      return;
    }

    if (settings.quizMode === 'type') {
      if (showResult) {
        event.preventDefault();
        nextFromResult();
        return;
      }

      event.preventDefault();
      submitTypedAnswer();
      return;
    }

    if (settings.quizMode === 'multipleChoice' && showResult) {
      event.preventDefault();
      nextFromResult();
      return;
    }

    if (settings.quizMode === 'selfGrade') {
      if (!flipped) {
        event.preventDefault();
        flipCard();
        return;
      }

      if (isPeeking) {
        event.preventDefault();
        togglePeek();
        return;
      }

      if (answerRevealedForGrade) {
        event.preventDefault();
        skipWithoutGrade();
      }
    }
  }

  $effect(() => {
    if (!browser) return;
    if (settings.quizMode !== 'type' || showResult || finished || !currentCard) return;

    currentIndex;
    tick().then(() => answerInput?.focus());
  });

  $effect(() => {
    if (!browser) return;

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  $effect(() => {
    exerciseSessionActive.set(!finished);
    return () => exerciseSessionActive.set(false);
  });
</script>

<div
  class="exercise-session"
  class:exercise-session--mc={settings.quizMode === 'multipleChoice'}
>
  {#if !finished}
    <div class="exercise-session__toolbar">
      <button
        class="btn-secondary exercise-session__end-btn"
        type="button"
        aria-label="End quiz"
        title="End quiz"
        onclick={requestEndQuiz}
      >
        <span class="exercise-toolbar-icon exercise-toolbar-icon--end" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" />
            <path d="M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="exercise-session__end-btn-text">End quiz</span>
      </button>
      <button
        class="exercise-session__toggle"
        class:exercise-session__toggle--hidden={hideProgress}
        type="button"
        aria-pressed={!hideProgress}
        aria-label="{hideProgress ? 'Show' : 'Hide'} progress"
        title="{hideProgress ? 'Show' : 'Hide'} progress"
        onclick={() => (hideProgress = !hideProgress)}
      >
        <span class="exercise-toolbar-icon" aria-hidden="true">
          <svg
            class="exercise-toolbar-icon__glyph"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
          >
            <rect x="3" y="9" width="18" height="6" rx="3" />
            <rect x="3" y="9" width="12" height="6" rx="3" fill="currentColor" stroke="none" />
          </svg>
          <svg class="exercise-toolbar-icon__strike" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 19L19 5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="exercise-session__toggle-label-full"
          >{hideProgress ? 'Show' : 'Hide'} progress</span
        >
      </button>
      <button
        class="exercise-session__toggle"
        class:exercise-session__toggle--hidden={hideCounter}
        type="button"
        aria-pressed={!hideCounter}
        aria-label="{hideCounter ? 'Show' : 'Hide'} counter"
        title="{hideCounter ? 'Show' : 'Hide'} counter"
        onclick={() => (hideCounter = !hideCounter)}
      >
        <span class="exercise-toolbar-icon exercise-toolbar-icon--counter" aria-hidden="true">
          <span class="exercise-toolbar-icon__glyph exercise-toolbar-counter">
            <span class="exercise-toolbar-counter__good">✓</span>
            <span class="exercise-toolbar-counter__wrong">✕</span>
          </span>
          <svg class="exercise-toolbar-icon__strike" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 19L19 5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="exercise-session__toggle-label-full"
          >{hideCounter ? 'Show' : 'Hide'} counter</span
        >
      </button>
    </div>
  {/if}

  {#if !finished && (!hideProgress || !hideCounter)}
    <div class="exercise-session__meta">
      {#if !hideProgress}
        <div class="exercise-progress">
          <div class="exercise-progress__track">
            <div class="exercise-progress__segments">
              {#each answerOutcomes as outcome, index (index)}
                <div
                  class="exercise-progress__segment"
                  class:exercise-progress__segment-correct={!hideCounter && outcome === 'correct'}
                  class:exercise-progress__segment-wrong={!hideCounter && outcome === 'wrong'}
                  class:exercise-progress__segment-neutral={hideCounter || outcome === 'pending'}
                  style="width: {segmentWidth}%"
                ></div>
              {/each}
            </div>
          </div>
          <span class="exercise-progress__label">
            {finished ? queue.length : currentIndex + 1} / {queue.length}
          </span>
        </div>
      {/if}

      {#if !hideCounter}
        <div class="exercise-counter">
          <span class="exercise-counter__good">✓ {correctCount}</span>
          <span class="exercise-counter__wrong">✕ {wrongCount}</span>
        </div>
      {/if}
    </div>
  {/if}

  {#if finished}
    <ExerciseComplete
      {settings}
      sessionLength={queue.length}
      {correctCount}
      {wrongCount}
      skipCount={reportSkipCount}
      {peekCount}
      {sessionDurationMs}
      cardsTimed={cardsShown}
      answerOutcomes={gradedOutcomes}
      {endedEarly}
      {decks}
      {tags}
      {exitLabel}
      onTryNew={onExit}
      onTryAgain={onTryAgain}
      onDashboard={onDashboard}
    />
  {:else}
    {#if currentCard}
    <div class="exercise-session__playfield">
    <div class="exercise-session__stage-wrap">
      <FlashcardStage
        prompt={currentCard.prompt}
        answer={currentCard.answer}
        {flipped}
        {entering}
        interactive={cardInteractive}
        peeking={isPeeking}
        onclick={handleCardInteraction}
        {showResult}
        isCorrect={lastCorrect}
        userAnswer={settings.quizMode === 'type' && showResult && typedAnswer.trim()
          ? typedAnswer
          : ''}
      />
    </div>

    {#if !showResult && !flipped && (settings.quizMode === 'selfGrade' || settings.quizMode === 'anki')}
      <div class="exercise-session__card-actions">
        {#if canPeek}
          <button class="btn-secondary exercise-peek-btn" type="button" onclick={togglePeek}>
            Peek answer
          </button>
        {/if}
        <button class="exercise-skip-btn" type="button" onclick={deferCard}>
          <span class="exercise-skip-btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M5 5v14" stroke-linecap="round" />
              <path d="M9 12h12" stroke-linecap="round" />
              <path d="M17 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          Skip
        </button>
      </div>
    {/if}

    {#if isPeeking && (settings.quizMode === 'selfGrade' || settings.quizMode === 'anki')}
      <div class="exercise-session__card-actions">
        <button class="btn-secondary exercise-peek-btn" type="button" onclick={togglePeek}>
          Hide answer
        </button>
      </div>
    {/if}

    {#if settings.quizMode === 'type' && !showResult}
      <form
        class="exercise-type-form"
        onsubmit={(event) => {
          event.preventDefault();
          submitTypedAnswer();
        }}
      >
        <input
          class="field-input exercise-type-form__input"
          class:field-input-warning={confirmEmptySkip}
          bind:this={answerInput}
          placeholder="Type your answer"
          bind:value={typedAnswer}
          oninput={handleTypedAnswerInput}
          autocomplete="off"
        />
        <div class="exercise-type-form__actions">
          {#if canPeek}
            <button class="btn-secondary exercise-peek-btn" type="button" onclick={togglePeek}>
              {flipped ? 'Hide answer' : 'Peek answer'}
            </button>
          {/if}
          <button class="exercise-skip-btn" type="button" onclick={deferCard}>
            <span class="exercise-skip-btn__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M5 5v14" stroke-linecap="round" />
                <path d="M9 12h12" stroke-linecap="round" />
                <path d="M17 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            Skip
          </button>
          <button
            class="btn-primary exercise-type-form__submit"
            class:btn-warning={confirmEmptySkip}
            type="submit"
          >
            {confirmEmptySkip ? 'Are you sure?' : 'Check'}
          </button>
        </div>
      </form>
      {#if confirmEmptySkip}
        <p class="exercise-skip-confirm">Are you sure you want to skip this card?</p>
      {/if}
    {/if}

    {#if settings.quizMode === 'multipleChoice' && !showResult}
      <div class="exercise-mc-panel">
        <div class="exercise-mc-toolbar">
          {#if canPeek}
            <button class="btn-secondary exercise-peek-btn exercise-mc-toolbar__btn" type="button" onclick={togglePeek}>
              {flipped ? 'Hide answer' : 'Peek answer'}
            </button>
          {/if}
          <button class="exercise-skip-btn exercise-mc-toolbar__btn" type="button" onclick={deferCard}>
            <span class="exercise-skip-btn__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M5 5v14" stroke-linecap="round" />
                <path d="M9 12h12" stroke-linecap="round" />
                <path d="M17 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            Skip
          </button>
        </div>
        <div class="exercise-mc-grid">
          {#each mcOptions as option, index (`${index}-${option}`)}
            <button class="exercise-mc-option" type="button" onclick={() => pickChoice(option)}>
              {option}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if showResult && (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice')}
      <div class="exercise-result-actions">
        <button class="btn-primary w-full sm:w-auto" type="button" onclick={nextFromResult}>
          {lastCorrect ? 'Next card' : 'Continue'}
        </button>
        {#if !lastCorrect}
          <button class="btn-secondary w-full sm:w-auto" type="button" onclick={tryAgainLaterFromResult}>
            Try again later
          </button>
        {/if}
      </div>

      <div
        class="exercise-result"
        class:exercise-result-correct={lastCorrect}
        class:exercise-result-wrong={!lastCorrect}
      >
        <p class="exercise-result__title">{lastCorrect ? 'Correct!' : 'Wrong'}</p>
        {#if settings.quizMode === 'type' && lastPercent !== null}
          <p class="exercise-result__meta">{lastPercent}% letter match</p>
        {/if}
        {#if !lastCorrect}
          <p class="exercise-result__hint">Review the answer on the card above.</p>
        {/if}
      </div>
    {/if}

    {#if flipped && answerRevealedForGrade && settings.quizMode === 'selfGrade' && !showResult}
      <div class="exercise-grade-row">
        <button class="btn-secondary" type="button" onclick={skipWithoutGrade}>Next card</button>
        <button class="btn-secondary exercise-grade-wrong" type="button" onclick={() => gradeSelf(false)}>
          I had it wrong
        </button>
        <button class="btn-secondary exercise-grade-correct" type="button" onclick={() => gradeSelf(true)}>
          I had it correct
        </button>
      </div>
    {/if}

    {#if flipped && answerRevealedForGrade && settings.quizMode === 'anki' && !showResult}
      <div class="exercise-grade-row">
        <button class="btn-secondary exercise-grade-wrong" type="button" onclick={() => gradeAnki('again')}>
          Again
        </button>
        <button class="btn-secondary" type="button" onclick={() => gradeAnki('good')}>Good</button>
        <button class="btn-secondary exercise-grade-correct" type="button" onclick={() => gradeAnki('easy')}>
          Easy
        </button>
      </div>
    {/if}

    {#if !flipped && (settings.quizMode === 'selfGrade' || settings.quizMode === 'anki')}
      <button class="btn-secondary w-full sm:w-auto" type="button" onclick={flipCard}>Flip card</button>
    {/if}
    </div>
    {/if}
  {/if}

  {#if !finished}
    <p class="exercise-session__keyboard-tip">Tip: Use enter key to proceed</p>
  {/if}
</div>

<ConfirmDialog
  open={confirmEndQuiz}
  title="End quiz?"
  message="Are you sure you want to quit?"
  confirmLabel="End quiz"
  cancelLabel="Keep going"
  onConfirm={endQuiz}
  onCancel={() => (confirmEndQuiz = false)}
/>
