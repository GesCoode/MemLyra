<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d="M4 10h16" />
  <path d="M6 10 8 6h8l2 4" />
  <path d="M5 10v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
  <path d="M9 18v-4h6v4" />
</svg>
