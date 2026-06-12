<script lang="ts">
  import HomeFlashcard from '$lib/components/home/HomeFlashcard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const isLoggedIn = $derived(data.user !== null);
</script>

<svelte:head>
  <title>MemLyra</title>
</svelte:head>

<section class="page-content home-page">
  <div class="home-hero">
    <div class="home-hero__copy">
      <h1 class="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-heading sm:text-5xl md:text-6xl">
        Your <span class="home-hero__free">FREE</span> study platform
      </h1>

      <p class="mt-6 max-w-lg text-lg leading-relaxed text-muted">
        <span class="home-hero__brand">MemLyra</span> is your free platform to create, store and practice
        flashcards. Choose your type of exercise, track your progress and ace your goals.
      </p>

      {#if !isLoggedIn}
        <div class="mt-8 flex flex-wrap gap-3">
          <a class="btn-primary" href="/register">Create account</a>
          <a class="btn-secondary" href="/login">Log in</a>
        </div>
      {:else}
        <div class="mt-8 flex flex-wrap gap-3">
          <a class="btn-primary" href="/dashboard">Open dashboard</a>
        </div>
      {/if}
    </div>

    {#if !isLoggedIn}
      <div class="home-hero__card">
        <HomeFlashcard />
      </div>
    {/if}
  </div>

  <div class="home-features grid gap-4 sm:grid-cols-3">
    <article class="feature-card">
      <h2 class="feature-card__title">Access Anywhere</h2>
      <p class="feature-card__desc">
        Use our tools to create and import decks of cards into your personal library and access
        them everywhere.
      </p>
    </article>
    <article class="feature-card">
      <h2 class="feature-card__title">Exercises</h2>
      <p class="feature-card__desc">
        Pick a quiz type and start practicing your flashcards.
      </p>
    </article>
    <article class="feature-card">
      <h2 class="feature-card__title">Progress</h2>
      <p class="feature-card__desc">
        Follow your progress and see statistics on how fast you are improving.
      </p>
    </article>
  </div>
</section>
