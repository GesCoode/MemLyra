<script lang="ts">
  let {
    value = 0,
    interactive = false,
    disabled = false,
    label = 'Deck rating',
    onChange
  }: {
    value?: number;
    interactive?: boolean;
    disabled?: boolean;
    label?: string;
    onChange?: (rating: number) => void;
  } = $props();

  function handleKeydown(event: KeyboardEvent, star: number) {
    if (!interactive || disabled) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange?.(Math.min(5, (value || 0) + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange?.(Math.max(1, (value || 1) - 1));
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onChange?.(star);
    }
  }
</script>

<div
  class="marketplace-stars"
  class:marketplace-stars--disabled={disabled}
  role={interactive ? 'radiogroup' : 'img'}
  aria-label={label}
  aria-disabled={interactive && disabled}
>
  {#each [1, 2, 3, 4, 5] as star}
    {#if interactive}
      <button
        class="marketplace-stars__button"
        class:marketplace-stars__button--active={star <= value}
        type="button"
        role="radio"
        aria-checked={star === value}
        aria-label={`${star} star${star === 1 ? '' : 's'}`}
        disabled={disabled}
        tabindex={star === Math.max(value, 1) ? 0 : -1}
        onclick={() => onChange?.(star)}
        onkeydown={(event) => handleKeydown(event, star)}
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
