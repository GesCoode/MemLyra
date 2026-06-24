<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/sections/Navbar.svelte';
  import Footer from '$lib/sections/Footer.svelte';
  import GuestRegisterNudge from '$lib/components/GuestRegisterNudge.svelte';
  import { page } from '$app/stores';
  import { setUser } from '$lib/stores/auth';
  import { setGuestMode } from '$lib/stores/guestMode';
  import { clearDecks, loadDecks } from '$lib/stores/decks';
  import { clearFlashcards, loadFlashcards } from '$lib/stores/flashcards';
  import { clearTags, loadTags } from '$lib/stores/tags';
  import { exerciseSessionActive } from '$lib/stores/exerciseUi';
  import { initTheme } from '$lib/stores/theme';
  import { loadGuestIntoStores } from '$lib/utils/guestSync';
  import { buildOrganizationJsonLd, jsonLdScript } from '$lib/utils/seo';

  let { children, data } = $props();

  $effect(() => {
    setUser(data.user);

    const onTryRoute = $page.url.pathname.startsWith('/try');
    const onMarketplaceRoute = $page.url.pathname.startsWith('/marketplace');
    const guestRoute = onTryRoute || onMarketplaceRoute;

    if (data.user) {
      setGuestMode(false);
      void loadDecks();
      void loadTags();
      void loadFlashcards();
    } else if (guestRoute) {
      setGuestMode(true);
      loadGuestIntoStores();
    } else {
      setGuestMode(false);
      clearDecks();
      clearTags();
      clearFlashcards();
    }
  });

  if (typeof window !== 'undefined') {
    initTheme();
  }

  const showGuestBanner = $derived(
    !data.user &&
      ($page.url.pathname.startsWith('/try') || $page.url.pathname.startsWith('/marketplace'))
  );
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  {@html `<script type="application/ld+json">${jsonLdScript(buildOrganizationJsonLd())}</script>`}
</svelte:head>

<div
  class="page-backdrop flex min-h-screen flex-col"
  class:page-backdrop--exercise={$exerciseSessionActive}
>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  {#if !$exerciseSessionActive}
    <Navbar user={data.user} />
  {/if}

  {#if showGuestBanner && !$exerciseSessionActive}
    <GuestRegisterNudge variant="banner" />
  {/if}

  <main id="main-content" class="flex-1" class:main--exercise={$exerciseSessionActive} tabindex="-1">
    {@render children()}
  </main>

  {#if !$exerciseSessionActive}
    <Footer user={data.user} />
  {/if}
</div>
