<script lang="ts">
  let {
    prompt,
    answer,
    flipped = false,
    entering = false,
    interactive = false,
    onclick,
    userAnswer = '',
    resultMeta = '',
    peeking = false
  }: {
    prompt: string;
    answer: string;
    flipped?: boolean;
    entering?: boolean;
    interactive?: boolean;
    onclick?: () => void;
    userAnswer?: string;
    resultMeta?: string;
    peeking?: boolean;
  } = $props();
</script>

{#snippet cardFaces()}
  <div class="exercise-card" class:exercise-card-flipped={flipped}>
    <div class="exercise-card-face exercise-card-front">
      <p class="exercise-card__label">Prompt</p>
      <p class="exercise-card__text">{prompt}</p>
    </div>

    <div class="exercise-card-face exercise-card-back">
      {#if userAnswer}
        <p class="exercise-card__label">Your answer</p>
        <p class="exercise-card__user-text">{userAnswer}</p>
      {/if}
      <p class="exercise-card__label" class:exercise-card__label-spaced={!!userAnswer}>
        {peeking ? 'Peek' : 'Answer'}
      </p>
      <p class="exercise-card__text">{answer}</p>
      {#if resultMeta}
        <p class="exercise-card__meta">{resultMeta}</p>
      {/if}
    </div>
  </div>
{/snippet}

<div class="exercise-stage">
  <div class="exercise-card-shadow" class:exercise-card-shadow-active={flipped}></div>

  <div class="exercise-card-enter-wrap" class:exercise-card-enter-wrap-active={entering}>
    {#if interactive}
      <button
        type="button"
        class="exercise-card-scene exercise-card-scene-interactive"
        onclick={() => onclick?.()}
      >
        {@render cardFaces()}
      </button>
    {:else}
      <div class="exercise-card-scene">
        {@render cardFaces()}
      </div>
    {/if}
  </div>
</div>
