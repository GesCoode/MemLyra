<script lang="ts">
  import { goto } from '$app/navigation';
  import { isLoggedIn } from '$lib/stores/auth';

  let { children } = $props();

  $effect(() => {
    if (!$isLoggedIn) {
      goto('/login');
    }
  });
</script>

{#if $isLoggedIn}
  {@render children()}
{/if}
