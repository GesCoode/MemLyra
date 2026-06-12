<script lang="ts">
  import type { Snippet } from 'svelte';

  type SectionSymbol = 'wordList' | 'decks' | 'tags' | 'import';

  let {
    title,
    description = '',
    descriptionEmphasis = '',
    symbol,
    open = $bindable(true),
    children
  }: {
    title: string;
    description?: string;
    descriptionEmphasis?: string;
    symbol?: SectionSymbol;
    open?: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="collapsible-section">
  <button
    class="collapsible-section__header"
    type="button"
    aria-expanded={open}
    aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
    onclick={() => (open = !open)}
  >
    <div class="collapsible-section__heading">
      <div class="collapsible-section__title-row">
        {#if symbol}
          <span
            class="collapsible-section__symbol collapsible-section__symbol-{symbol}"
            aria-hidden="true"
          >
            {#if symbol === 'wordList'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M4 6h16M4 12h16M4 18h10" stroke-linecap="round" />
                <path d="M18 18h2v-3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            {:else if symbol === 'decks'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <rect x="3" y="9" width="13" height="11" rx="1.5" />
                <path d="M7 5h13v11" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            {:else if symbol === 'tags'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.82 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                  stroke-linejoin="round"
                />
                <circle cx="7" cy="7" r="2.25" fill="currentColor" stroke="none" />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M12 4v10" stroke-linecap="round" />
                <path d="M8 10l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 20h14" stroke-linecap="round" />
              </svg>
            {/if}
          </span>
        {/if}
        <h2 class="library-panel__title">{title}</h2>
      </div>
      {#if descriptionEmphasis || description}
        <p class="library-panel__desc">
          {#if descriptionEmphasis}
            <span class="library-panel__desc-lead">{descriptionEmphasis}</span>
          {/if}
          {#if description}
            {#if descriptionEmphasis}
              {' '}
            {/if}{description}
          {/if}
        </p>
      {/if}
    </div>
    <span
      class="collapsible-section__chevron"
      class:collapsible-section__chevron-collapsed={!open}
      aria-hidden="true"
    >
      ▼
    </span>
  </button>

  <div class="collapsible-section__body" class:collapsible-section__body-open={open}>
    <div class="collapsible-section__inner">
      {@render children()}
    </div>
  </div>
</div>
