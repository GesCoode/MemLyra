<script lang="ts">
  let {
    variant = 'regular',
    filled = true,
    class: className = ''
  }: {
    variant?: 'regular' | 'special' | 'bothWays';
    filled?: boolean;
    class?: string;
  } = $props();

  const outlinePath =
    'M12 3.5l2.4 5.4 5.9.5-4.5 3.9 1.4 5.8L12 16.2 6.8 18.1l1.4-5.8-4.5-3.9 5.9-.5L12 3.5z';
</script>

{#if !filled}
  <svg
    class="star-icon star-icon-empty {variant === 'special'
      ? 'star-icon-special'
      : variant === 'bothWays'
        ? 'star-icon-bothways'
        : 'star-icon-regular'} {className}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
  >
    <path d={outlinePath} stroke-linejoin="round" />
  </svg>
{:else if variant === 'bothWays'}
  <svg
    class="star-icon star-icon-bothways {className}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
  >
    <defs>
      <linearGradient id="star-bothways-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#b8f5d4" />
        <stop offset="50%" stop-color="#6fcf97" />
        <stop offset="100%" stop-color="#43aa72" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.2l2.5 5.7 6.2.5-4.7 4.1 1.4 6.1L12 16.4 6.6 18.6l1.4-6.1-4.7-4.1 6.2-.5L12 2.2z"
      fill="url(#star-bothways-gradient)"
    />
    <path
      d="M8.5 12.2h7M10.2 10.5l-1.7 1.7 1.7 1.7M13.8 10.5l1.7 1.7-1.7 1.7"
      fill="none"
      stroke="#0f2a1c"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{:else if variant === 'special'}
  <svg
    class="star-icon star-icon-special {className}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
  >
    <defs>
      <linearGradient id="star-special-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff4c4" />
        <stop offset="45%" stop-color="#e8c468" />
        <stop offset="100%" stop-color="#c8942a" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
      fill="url(#star-special-gradient)"
    />
    <path
      d="M12 5.2l1.8 4.1 4.5.4-3.4 2.9 1 4.4L12 14.8l-4.1 2.2 1-4.4-3.4-2.9 4.5-.4L12 5.2z"
      fill="rgba(255,255,255,0.35)"
    />
  </svg>
{:else}
  <svg
    class="star-icon star-icon-regular {className}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
  >
    <path d={outlinePath} stroke-linejoin="round" />
  </svg>
{/if}
