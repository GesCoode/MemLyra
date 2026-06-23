<script lang="ts">
  import MarketplaceView from '$lib/components/marketplace/MarketplaceView.svelte';
</script>

<svelte:head>
  <title>Deck marketplace · MemLyra</title>
</svelte:head>

<MarketplaceView
  backHref="/dashboard/library"
  libraryHref="/dashboard/library"
  canRate={true}
  canPublish={true}
  loginHref="/login"
/>
