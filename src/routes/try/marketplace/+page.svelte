<script lang="ts">
  import MarketplaceView from '$lib/components/marketplace/MarketplaceView.svelte';
</script>

<svelte:head>
  <title>Deck marketplace · MemLyra</title>
</svelte:head>

<MarketplaceView
  backHref="/try/library"
  libraryHref="/try/library"
  canRate={false}
  loginHref="/login"
/>
