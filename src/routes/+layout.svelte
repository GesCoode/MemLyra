<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/sections/Navbar.svelte';
  import Footer from '$lib/sections/Footer.svelte';
  import { initAuth } from '$lib/stores/auth';
  import { initDecks } from '$lib/stores/decks';
  import { initFlashcards } from '$lib/stores/flashcards';
  import { initTags } from '$lib/stores/tags';
  import { initTheme } from '$lib/stores/theme';

  let { children } = $props();

  if (typeof window !== 'undefined') {
    initTheme();
    initAuth();
    initDecks();
    initTags();
    initFlashcards();
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>MemLyra</title>
</svelte:head>

<div class="page-backdrop flex min-h-screen flex-col">
  <Navbar />

  <main class="flex-1">
    {@render children()}
  </main>

  <Footer />
</div>
