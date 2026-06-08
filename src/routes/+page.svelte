<script lang="ts">
  import HomeFlashcard from '$lib/components/home/HomeFlashcard.svelte';
  import { isLoggedIn } from '$lib/stores/auth';
</script>

<svelte:head>
  <title>MemLyra</title>
</svelte:head>

<section class="page-content home-page">
  <div class="home-hero">
    <div class="home-hero__copy">
      <h1 class="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-heading sm:text-5xl md:text-6xl">
        Study with flashcards
      </h1>

      <p class="mt-6 max-w-lg text-lg leading-relaxed text-muted">
        MemLyra is a place to make flashcards, practice them in exercises, and see what you
        have learned. Your cards and progress are saved to your account.
      </p>

      {#if !$isLoggedIn}
        <p class="home-free-note">Free to use</p>

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

    {#if !$isLoggedIn}
      <div class="home-hero__card">
        <HomeFlashcard />
      </div>
    {/if}
  </div>

  <div class="home-features grid gap-4 sm:grid-cols-3">
    <article class="feature-card">
      <p class="text-sm font-semibold text-heading">Library</p>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        Add flashcards, assign decks and tags, and import lists from a file.
      </p>
    </article>
    <article class="feature-card">
      <p class="text-sm font-semibold text-heading">Exercises</p>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        Practice your cards with filters, quiz types, and both directions.
      </p>
    </article>
    <article class="feature-card">
      <p class="text-sm font-semibold text-heading">Progress</p>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        Stars mark cards you have learned, mastered, or know both ways.
      </p>
    </article>
  </div>
</section>
