<script lang="ts">
  import { browser } from '$app/environment';
  import { tick } from 'svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import ExerciseComplete from '$lib/components/exercise/ExerciseComplete.svelte';
  import FlashcardStage from '$lib/components/exercise/FlashcardStage.svelte';
  import type { Deck } from '$lib/stores/decks';
  import type { Flashcard } from '$lib/stores/flashcards';
  import type { Tag } from '$lib/stores/tags';
  import { recordExerciseResult, recordExerciseSeen } from '$lib/stores/flashcards';
  import { filterFlashcards } from '$lib/utils/exercise';
  import {
    buildMultipleChoiceOptions,
    type ExerciseSettings,
    type QuizMode,
    type SessionCard
  } from '$lib/utils/exercise';
  import { scoreGuess } from '$lib/utils/scoreGuess';

  let {
    session,
    settings,
    pool,
    decks = [],
    tags = [],
    onExit,
    onTryAgain,
    onDashboard
  }: {
    session: SessionCard[];
    settings: ExerciseSettings;
    pool: Flashcard[];
    decks?: Deck[];
    tags?: Tag[];
    onExit: () => void;
    onTryAgain: () => void;
    onDashboard: () => void;
  } = $props();

  const startingSession = session;
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
  let answerOutcomes = $state<Array<'correct' | 'wrong'>>([]);
  let skipCount = $state(0);
  let reportSkipCount = $state(0);
  let peekCount = $state(0);
  let cardsShown = $state(1);
  const sessionStartedAt = Date.now();
  let sessionDurationMs = $state(0);

  let isPeeking = $derived(settings.allowPeeking && flipped && !showResult);
  let canPeek = $derived(
    settings.allowPeeking &&
      !showResult &&
      (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice')
  );

  let currentCard = $derived(queue[currentIndex]);
  let segmentWidth = $derived(queue.length > 0 ? 100 / queue.length : 0);
  let mcOptions = $derived(
    currentCard ? buildMultipleChoiceOptions(currentCard, filteredPool) : []
  );

  function resetCardState() {
    flipped = false;
    typedAnswer = '';
    showResult = false;
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

  function recordAndAdvance(correct: boolean) {
    if (!currentCard) return;

    void recordExerciseResult(currentCard.cardId, correct, currentCard.direction);
    if (correct) correctCount += 1;
    else wrongCount += 1;
    answerOutcomes.push(correct ? 'correct' : 'wrong');
    gradedSessionIds = new Set(gradedSessionIds).add(currentCard.id);

    if (allCardsGraded()) {
      finishSession();
      return;
    }

    advanceToNextCard();
  }

  function advanceWithoutGrade() {
    if (!currentCard) return;

    void recordExerciseSeen(currentCard.cardId);

    if (currentIndex >= queue.length - 1) {
      finishSession();
      return;
    }

    entering = true;
    resetCardState();
    currentIndex += 1;
    cardsShown += 1;

    window.setTimeout(() => {
      entering = false;
    }, 420);
  }

  function flipCard() {
    if (finished || showResult) return;
    if (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice') return;
    flipped = true;
  }

  function togglePeek() {
    if (!canPeek) return;
    if (!flipped) peekCount += 1;
    flipped = !flipped;
  }

  function handleCardInteraction() {
    if (finished || !currentCard || !showResult) return;

    if (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice') {
      nextFromResult();
    }
  }

  let cardInteractive = $derived(
    showResult && (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice')
  );

  function submitTypedAnswer() {
    if (!currentCard || showResult) return;

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
    lastPercent = result.percent;
    lastCorrect = result.isCorrect;
    showResult = true;
    flipped = true;
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
    if (!currentCard || showResult) return;
    selectedChoice = choice;
    lastCorrect = choice === currentCard.answer;
    lastPercent = lastCorrect ? 100 : 0;
    showResult = true;
    flipped = true;
  }

  function gradeSelf(correct: boolean) {
    recordAndAdvance(correct);
  }

  function gradeAnki(level: 'again' | 'good' | 'easy') {
    const correct = level !== 'again';
    recordAndAdvance(correct);
  }

  function nextFromResult() {
    if (!showResult || lastCorrect === null) return;
    recordAndAdvance(lastCorrect);
  }

  function skipWithoutGrade() {
    advanceWithoutGrade();
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
</script>

<div
  class="exercise-session"
  class:exercise-session--mc={settings.quizMode === 'multipleChoice' && !showResult}
>
  {#if !finished}
    <div class="exercise-session__toolbar">
      <button class="btn-secondary exercise-session__end-btn" type="button" onclick={requestEndQuiz}>
        End quiz
      </button>

      <div class="exercise-session__toolbar-actions">
      <button
        class="exercise-session__toggle"
        type="button"
        onclick={() => (hideProgress = !hideProgress)}
      >
        {hideProgress ? 'Show' : 'Hide'} progress
      </button>
      <button
        class="exercise-session__toggle"
        type="button"
        onclick={() => (hideCounter = !hideCounter)}
      >
        {hideCounter ? 'Show' : 'Hide'} counter
      </button>
    </div>
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
                  class:exercise-progress__segment-neutral={hideCounter}
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
      {answerOutcomes}
      {endedEarly}
      {decks}
      {tags}
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
        userAnswer={settings.quizMode === 'type' && showResult && typedAnswer.trim()
          ? typedAnswer
          : ''}
        resultMeta={showResult && settings.quizMode === 'type' && lastPercent !== null
          ? `${lastPercent}% letter match`
          : ''}
      />
    </div>

    {#if !showResult && !flipped && (settings.quizMode === 'selfGrade' || settings.quizMode === 'anki')}
      <div class="exercise-session__card-actions">
        <button class="btn-secondary exercise-skip-btn" type="button" onclick={deferCard}>
          Skip
        </button>
      </div>
    {:else if !showResult && canPeek && settings.quizMode !== 'multipleChoice'}
      <div class="exercise-session__card-actions">
        <button class="btn-secondary exercise-peek-btn" type="button" onclick={togglePeek}>
          {flipped ? 'Hide answer' : 'Peek answer'}
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
        <button class="btn-secondary shrink-0" type="button" onclick={deferCard}>Skip</button>
        <button
          class="btn-primary shrink-0"
          class:btn-warning={confirmEmptySkip}
          type="submit"
        >
          {confirmEmptySkip ? 'Are you sure?' : 'Check'}
        </button>
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
          <button class="btn-secondary exercise-skip-btn exercise-mc-toolbar__btn" type="button" onclick={deferCard}>
            Skip
          </button>
        </div>
        <div class="exercise-mc-grid">
          {#each mcOptions as option (option)}
            <button class="exercise-mc-option" type="button" onclick={() => pickChoice(option)}>
              {option}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if showResult && (settings.quizMode === 'type' || settings.quizMode === 'multipleChoice')}
      <div class="exercise-result" class:exercise-result-correct={lastCorrect} class:exercise-result-wrong={!lastCorrect}>
        <p>{lastCorrect ? 'Correct' : 'Not quite'}</p>
        {#if settings.quizMode === 'type' && lastPercent !== null}
          <p class="exercise-result__meta">{lastPercent}% letter match</p>
        {/if}
      </div>
      <button class="btn-primary w-full sm:w-auto" type="button" onclick={nextFromResult}>Next card</button>
    {/if}

    {#if flipped && settings.quizMode === 'selfGrade' && !showResult}
      <div class="exercise-grade-row">
        <button class="btn-secondary" type="button" onclick={skipWithoutGrade}>Next card</button>
        <button class="btn-secondary exercise-grade-wrong" type="button" onclick={() => gradeSelf(false)}>
          I had it wrong
        </button>
        <button class="btn-primary exercise-grade-correct" type="button" onclick={() => gradeSelf(true)}>
          I had it correct
        </button>
      </div>
    {/if}

    {#if flipped && settings.quizMode === 'anki' && !showResult}
      <div class="exercise-grade-row">
        <button class="btn-secondary exercise-grade-wrong" type="button" onclick={() => gradeAnki('again')}>
          Again
        </button>
        <button class="btn-secondary" type="button" onclick={() => gradeAnki('good')}>Good</button>
        <button class="btn-primary exercise-grade-correct" type="button" onclick={() => gradeAnki('easy')}>
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
