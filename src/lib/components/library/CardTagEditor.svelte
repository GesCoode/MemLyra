<script lang="ts">
  import { browser } from '$app/environment';
  import { updateFlashcardTags } from '$lib/stores/flashcards';
  import type { Tag } from '$lib/stores/tags';
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
  let addButtonEl = $state<HTMLButtonElement | null>(null);
  let menuEl = $state<HTMLDivElement | null>(null);

  let assignedTags = $derived(
    tagIds
      .map((id) => tags.find((tag) => tag.id === id))
      .filter((tag): tag is Tag => Boolean(tag))
  );

  let availableTags = $derived(tags.filter((tag) => !tagIds.includes(tag.id)));

  function updateMenuPosition() {
    if (!browser || !addButtonEl) return;

    const triggerRect = addButtonEl.getBoundingClientRect();
    const menuHeight = menuEl?.offsetHeight ?? 140;
    const menuWidth = menuEl?.offsetWidth ?? 160;
    const gap = 6;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const opensUp = spaceBelow < menuHeight + gap;

    let left = triggerRect.left;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    menuPosition = {
      left,
      top: opensUp
        ? Math.max(8, triggerRect.top - menuHeight - gap)
        : triggerRect.bottom + gap
    };
  }

  function openMenu() {
    menuOpen = true;
    queueMicrotask(() => {
      updateMenuPosition();
      queueMicrotask(updateMenuPosition);
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
    onclick={closeMenu}
  ></button>

  <div
    class="card-tag-editor__menu"
    bind:this={menuEl}
    role="menu"
    aria-label="Add tag"
    style="top: {menuPosition.top}px; left: {menuPosition.left}px;"
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
      <button
        class="tag-chip__action tag-chip__add"
        type="button"
        bind:this={addButtonEl}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Add tag"
        title="Add tag"
        disabled={availableTags.length === 0 && !menuOpen}
        onclick={toggleMenu}
      >
        +
      </button>
    {/if}
  </div>
</div>
