<script lang="ts">
  import HomeFlashcard from '$lib/components/home/HomeFlashcard.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { PRACTICE_ENTRY_LABEL } from '$lib/app';
  import {
    buildSoftwareApplicationJsonLd,
    buildWebSiteJsonLd,
    SEO_DESCRIPTIONS
  } from '$lib/utils/seo';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const isLoggedIn = $derived(data.user !== null);
</script>

<SeoHead
  title="MemLyra — free flashcard practice"
  description={SEO_DESCRIPTIONS.home}
  path="/"
  includeBrand={false}
  jsonLd={[buildWebSiteJsonLd(), buildSoftwareApplicationJsonLd()]}
/>

<section class="page-content home-page">
  <div class="home-hero">
    <div class="home-hero__copy">
      <h1 class="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-heading sm:text-5xl md:text-6xl">
        Your <span class="home-hero__free">FREE</span> study platform
      </h1>

      <p id="home-hero-desc" class="mt-6 max-w-lg text-lg leading-relaxed text-muted">
        <span class="home-hero__brand">MemLyra</span> is your free platform to practice with flashcards.
        Start now and <em>ace</em> your goals!
      </p>

      {#if !isLoggedIn}
        <div class="home-hero__actions" role="group" aria-describedby="home-hero-desc">
          <a class="home-hero__cta btn-primary" href="/try">
            <span class="home-hero__cta-label">{PRACTICE_ENTRY_LABEL}</span>
            <span class="home-hero__cta-hint">Free · no account needed</span>
          </a>
          <div class="home-hero__secondary-actions">
            <a class="btn-secondary home-hero__secondary-btn" href="/register">Create account</a>
            <a class="home-hero__login-link" href="/login">Log in</a>
          </div>
        </div>
      {:else}
        <div class="mt-8 flex flex-wrap gap-3">
          <a class="btn-primary" href="/dashboard">Open dashboard</a>
        </div>
      {/if}
    </div>

    <div class="home-hero__card">
      <HomeFlashcard {isLoggedIn} />
    </div>
  </div>

  <div class="home-features grid gap-4 sm:grid-cols-3">
    <article class="feature-card feature-card-access">
      <div class="feature-card__header">
        <div class="feature-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="12" cy="12" r="10" />
            <path
              d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="feature-card__title">Access anywhere</h2>
      </div>
      <p class="feature-card__desc">
        Import decks of cards into your personal library and access them everywhere.
      </p>
    </article>
    <a class="feature-card feature-card-exercise feature-card--link" href="/try">
      <div class="feature-card__header">
        <div class="feature-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M8 5v14l11-7L8 5z" stroke-linejoin="round" />
          </svg>
        </div>
        <h2 class="feature-card__title">Exercises</h2>
      </div>
      <p class="feature-card__desc">
        Pick a quiz type and start practicing your flashcards.
      </p>
    </a>
    <article class="feature-card feature-card-progress">
      <div class="feature-card__header">
        <div class="feature-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
            />
          </svg>
        </div>
        <h2 class="feature-card__title">Progress</h2>
      </div>
      <p class="feature-card__desc">
        Follow your progress and see statistics on how fast you are improving.
      </p>
    </article>
  </div>
</section>
