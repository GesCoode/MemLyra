<script lang="ts">
  import StarIcon from '$lib/components/icons/StarIcon.svelte';

  let {
    count,
    variant = 'regular'
  }: {
    count: number;
    variant?: 'regular' | 'special' | 'bothWays';
  } = $props();

  const titles = {
    regular: 'Learned one way',
    special: 'Mastered flashcards',
    bothWays: 'Known both ways'
  } as const;
</script>

<div
  class="star-counter {variant === 'special'
    ? 'star-counter-special'
    : variant === 'bothWays'
      ? 'star-counter-bothways'
      : 'star-counter-regular'}"
  title={titles[variant]}
>
  <span class="star-counter__value">{count}</span>
  <StarIcon {variant} class="star-counter__icon" />
</div>
