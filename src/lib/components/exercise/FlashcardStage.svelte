<script lang="ts">
  let {
    prompt,
    answer,
    flipped = false,
    entering = false,
    interactive = false,
    onclick,
    userAnswer = '',
    peeking = false,
    showResult = false,
    isCorrect = null
  }: {
    prompt: string;
    answer: string;
    flipped?: boolean;
    entering?: boolean;
    interactive?: boolean;
    onclick?: () => void;
    userAnswer?: string;
    peeking?: boolean;
    showResult?: boolean;
    isCorrect?: boolean | null;
  } = $props();

  let haloHidden = $state(false);

  function handleFlipTransitionStart(event: TransitionEvent) {
    if (event.propertyName !== 'transform') return;
    haloHidden = true;
  }

  function handleFlipTransitionEnd(event: TransitionEvent) {
    if (event.propertyName !== 'transform') return;
    haloHidden = false;
  }

  function handleSceneClick() {
    if (interactive) onclick?.();
  }

  function handleSceneKeydown(event: KeyboardEvent) {
    if (!interactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onclick?.();
    }
  }
</script>

<div class="exercise-stage">
  <div class="exercise-card-shadow" class:exercise-card-shadow-active={flipped}></div>

  <div
    class="exercise-card-enter-wrap"
    class:exercise-card-enter-wrap-active={entering}
    class:exercise-card-enter-wrap--halo-hidden={haloHidden}
  >
    <!-- Keep a stable wrapper so flip transitions are not destroyed on state change -->
    <div
      class="exercise-card-scene"
      class:exercise-card-scene-interactive={interactive}
      role={interactive ? 'button' : undefined}
      tabindex={interactive ? 0 : undefined}
      aria-label={interactive ? (flipped ? 'Show prompt card' : 'Flip to answer card') : undefined}
      onclick={handleSceneClick}
      onkeydown={handleSceneKeydown}
    >
      <div
        class="exercise-card-flip"
        class:exercise-card-flip--active={flipped}
        ontransitionstart={handleFlipTransitionStart}
        ontransitionend={handleFlipTransitionEnd}
      >
        <div class="exercise-card-side exercise-card-side--prompt">
          <p class="exercise-card__label">Prompt</p>
          <p class="exercise-card__text">{prompt}</p>
        </div>

        <div
          class="exercise-card-side exercise-card-side--answer"
          class:exercise-card-side--correct={showResult && isCorrect === true}
          class:exercise-card-side--wrong={showResult && isCorrect === false}
        >
          <p class="exercise-card__label">Prompt</p>
          <p class="exercise-card__prompt-muted">{prompt}</p>

          <p class="exercise-card__label exercise-card__label-answer">
            {peeking && !showResult ? 'Peek' : 'Answer'}
          </p>
          <p class="exercise-card__text exercise-card__text--answer">{answer}</p>

          {#if userAnswer}
            <p class="exercise-card__user-attempt">
              <span class="exercise-card__user-attempt-label">You wrote</span>
              {userAnswer}
            </p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
