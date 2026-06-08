<script lang="ts">
  import type { Tag } from '$lib/stores/tags';
  import { tagChipStyles } from '$lib/utils/tagColors';

  let {
    tagIds = [],
    tags = [],
    interactive = false,
    selectedIds = [],
    onclickTag
  }: {
    tagIds?: string[];
    tags?: Tag[];
    interactive?: boolean;
    selectedIds?: string[];
    onclickTag?: (tagId: string) => void;
  } = $props();

  let visibleTags = $derived(
    tagIds
      .map((id) => tags.find((tag) => tag.id === id))
      .filter((tag): tag is Tag => Boolean(tag))
  );
</script>

{#if visibleTags.length === 0}
  <span class="library-table__dash">—</span>
{:else}
  <div class="tag-chip-row tag-chip-row-compact">
    {#each visibleTags as tag (tag.id)}
      {#if interactive}
        <button
          class="tag-chip tag-chip-colored {selectedIds.includes(tag.id) ? 'tag-chip-colored-active' : ''}"
          type="button"
          style={tagChipStyles(tag.color, selectedIds.includes(tag.id))}
          onclick={() => onclickTag?.(tag.id)}
        >
          {tag.label}
        </button>
      {:else}
        <span class="tag-chip tag-chip-colored tag-chip-readonly" style={tagChipStyles(tag.color, true)}>
          {tag.label}
        </span>
      {/if}
    {/each}
  </div>
{/if}
