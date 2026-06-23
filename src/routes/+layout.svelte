<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/sections/Navbar.svelte';
  import Footer from '$lib/sections/Footer.svelte';
  import { page } from '$app/stores';
  import { setUser } from '$lib/stores/auth';
  import { setGuestMode } from '$lib/stores/guestMode';
  import { clearDecks, loadDecks } from '$lib/stores/decks';
  import { clearFlashcards, loadFlashcards } from '$lib/stores/flashcards';
  import { clearTags, loadTags } from '$lib/stores/tags';
  import { exerciseSessionActive } from '$lib/stores/exerciseUi';
  import { initTheme } from '$lib/stores/theme';
  import { loadGuestIntoStores } from '$lib/utils/guestSync';

  let { children, data } = $props();

  $effect(() => {
    setUser(data.user);

    const onTryRoute = $page.url.pathname.startsWith('/try');

    if (data.user) {
      setGuestMode(false);
      void loadDecks();
      void loadTags();
      void loadFlashcards();
    } else if (onTryRoute) {
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
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>MemLyra</title>
</svelte:head>

<div
  class="page-backdrop flex min-h-screen flex-col"
  class:page-backdrop--exercise={$exerciseSessionActive}
>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  {#if !$exerciseSessionActive}
    <Navbar user={data.user} />
  {/if}

  <main id="main-content" class="flex-1" class:main--exercise={$exerciseSessionActive} tabindex="-1">
    {@render children()}
  </main>

  {#if !$exerciseSessionActive}
    <Footer />
  {/if}
</div>
