<script lang="ts">
  import { goto } from '$app/navigation';
  import type { LayoutData } from './$types';

  let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

  $effect(() => {
    if (data.user) {
      goto('/dashboard', { replaceState: true });
    }
  });
</script>

{#if !data.user}
  {@render children()}
{/if}
