<script lang="ts">
  let {
    value = 0,
    interactive = false,
    label = 'Deck rating',
    onChange
  }: {
    value?: number;
    interactive?: boolean;
    label?: string;
    onChange?: (rating: number) => void;
  } = $props();
</script>

<div class="marketplace-stars" role={interactive ? 'radiogroup' : 'img'} aria-label={label}>
  {#each [1, 2, 3, 4, 5] as star}
    {#if interactive}
      <button
        class="marketplace-stars__button"
        class:marketplace-stars__button--active={star <= value}
        type="button"
        role="radio"
        aria-checked={star === value}
        aria-label={`${star} star${star === 1 ? '' : 's'}`}
        onclick={() => onChange?.(star)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
          />
        </svg>
      </button>
    {:else}
      <span
        class="marketplace-stars__star"
        class:marketplace-stars__star--active={star <= Math.round(value)}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
          />
        </svg>
      </span>
    {/if}
  {/each}
</div>
