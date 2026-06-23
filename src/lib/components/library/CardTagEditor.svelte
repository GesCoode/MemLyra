<script lang="ts">
  import { browser } from '$app/environment';
  import { updateFlashcardTags } from '$lib/stores/flashcards';
  import type { Tag } from '$lib/stores/tags';
  import { getFixedMenuPosition } from '$lib/utils/anchoredMenu';
  import { portal } from '$lib/utils/portal';
  import { tagChipStyles } from '$lib/utils/tagColors';

  let {
    cardId,
    tagIds = [],
    tags = []
  }: {
    cardId: string;
    tagIds?: string[];
    tags?: Tag[];
  } = $props();

  let menuOpen = $state(false);
  let menuPosition = $state({ top: 0, left: 0 });
  let anchorEl = $state<HTMLSpanElement | null>(null);
  let menuEl = $state<HTMLDivElement | null>(null);

  let assignedTags = $derived(
    tagIds
      .map((id) => tags.find((tag) => tag.id === id))
      .filter((tag): tag is Tag => Boolean(tag))
  );

  let availableTags = $derived(tags.filter((tag) => !tagIds.includes(tag.id)));

  function updateMenuPlacement() {
    if (!browser || !anchorEl) return;
    menuPosition = getFixedMenuPosition(anchorEl, menuEl);
  }

  function openMenu() {
    menuOpen = true;
    queueMicrotask(() => {
      updateMenuPlacement();
      queueMicrotask(updateMenuPlacement);
    });
  }

  function closeMenu() {
    menuOpen = false;
  }

  function removeTag(tagId: string) {
    void updateFlashcardTags(
      cardId,
      tagIds.filter((id) => id !== tagId)
    );
  }

  function addTag(tagId: string) {
    if (tagIds.includes(tagId)) return;
    void updateFlashcardTags(cardId, [...tagIds, tagId]);
    if (availableTags.length <= 1) closeMenu();
  }

  function toggleMenu() {
    if (tags.length === 0) return;
    if (menuOpen) {
      closeMenu();
      return;
    }
    openMenu();
  }
</script>

{#if menuOpen}
  <button
    class="card-tag-editor__backdrop"
    type="button"
    aria-label="Close tag menu"
    use:portal
    onclick={closeMenu}
  ></button>

  <div
    class="card-tag-editor__menu card-tag-editor__menu--floating"
    style:top="{menuPosition.top}px"
    style:left="{menuPosition.left}px"
    bind:this={menuEl}
    use:portal
    role="menu"
    aria-label="Add tag"
  >
    {#if availableTags.length === 0}
      <p class="card-tag-editor__menu-empty">All tags assigned</p>
    {:else}
      {#each availableTags as tag (tag.id)}
        <button
          class="card-tag-editor__menu-item"
          type="button"
          role="menuitem"
          style={tagChipStyles(tag.color, false)}
          onclick={() => addTag(tag.id)}
        >
          {tag.label}
        </button>
      {/each}
    {/if}
  </div>
{/if}

<div class="card-tag-editor">
  <div class="tag-chip-row tag-chip-row-compact">
    {#each assignedTags as tag (tag.id)}
      <span
        class="tag-chip tag-chip-colored tag-chip-removable"
        style={tagChipStyles(tag.color, true)}
      >
        {tag.label}
        <button
          class="tag-chip__action tag-chip__remove"
          type="button"
          aria-label="Remove tag {tag.label}"
          onclick={() => removeTag(tag.id)}
        >
          ×
        </button>
      </span>
    {/each}

    {#if tags.length === 0}
      <span class="card-tag-editor__hint">Create tags below</span>
    {:else}
      <span class="card-tag-editor__anchor" bind:this={anchorEl}>
        <button
          class="tag-chip__action tag-chip__add"
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Add tag"
          title="Add tag"
          disabled={availableTags.length === 0 && !menuOpen}
          onclick={toggleMenu}
        >
          +
        </button>
      </span>
    {/if}
  </div>
</div>
