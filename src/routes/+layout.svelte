<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/sections/Navbar.svelte';
  import Footer from '$lib/sections/Footer.svelte';
  import { setUser } from '$lib/stores/auth';
  import { clearDecks, loadDecks } from '$lib/stores/decks';
  import { clearFlashcards, loadFlashcards } from '$lib/stores/flashcards';
  import { clearTags, loadTags } from '$lib/stores/tags';
  import { initTheme } from '$lib/stores/theme';

  let { children, data } = $props();

  $effect(() => {
    setUser(data.user);

    if (data.user) {
      void loadDecks();
      void loadTags();
      void loadFlashcards();
    } else {
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

<div class="page-backdrop flex min-h-screen flex-col">
  <Navbar user={data.user} />

  <main class="flex-1">
    {@render children()}
  </main>

  <Footer />
</div>
