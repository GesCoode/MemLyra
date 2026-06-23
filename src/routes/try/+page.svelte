<script lang="ts">
  import StarCounter from '$lib/components/StarCounter.svelte';
  import { PRACTICE_HUB_TITLE } from '$lib/app';

  const sections = [
    {
      href: '/try/exercise',
      title: 'Start exercise',
      description: 'Pick a quiz style and practice your cards.',
      theme: 'exercise',
      label: 'Practice'
    },
    {
      href: '/try/library',
      title: 'Flashcard library',
      description: 'Add cards, tags, and imports.',
      theme: 'library',
      label: 'Collection'
    }
  ] as const;
</script>

<svelte:head>
  <title>{PRACTICE_HUB_TITLE} · MemLyra</title>
</svelte:head>

<section class="page-content" aria-labelledby="practice-hub-heading">
  <h1 id="practice-hub-heading" class="library-header__title mt-0">{PRACTICE_HUB_TITLE}</h1>

  <nav class="mt-10 grid gap-5" aria-label="Practice areas">
    {#each sections as section}
      <a
        class="dashboard-card dashboard-card-{section.theme} group"
        href={section.href}
        aria-label="{section.title} — {section.description}"
      >
        <div class="dashboard-card__icon" aria-hidden="true">
          {#if section.theme === 'exercise'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M8 5v14l11-7L8 5z" stroke-linejoin="round" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M4 6h16M4 12h16M4 18h10" stroke-linecap="round" />
              <path d="M18 18h2v-3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {/if}
        </div>

        <div class="dashboard-card__body">
          <span class="dashboard-card__label">{section.label}</span>
          <h2 class="dashboard-card__title">{section.title}</h2>
          <p class="dashboard-card__desc">{section.description}</p>
        </div>

        <div class="dashboard-card__aside">
          <span class="dashboard-card__arrow" aria-hidden="true">→</span>
        </div>
      </a>
    {/each}

    <article
      class="dashboard-card dashboard-card-learned dashboard-card--locked"
      aria-labelledby="practice-progress-title"
      aria-describedby="practice-progress-desc"
    >
      <div class="dashboard-card__lock-veil" aria-hidden="true"></div>

      <div class="dashboard-card__icon dashboard-card__icon--locked" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
          />
        </svg>
        <span class="dashboard-card__icon-lock">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round" />
          </svg>
        </span>
      </div>

      <div class="dashboard-card__body dashboard-card__body--locked">
        <span class="dashboard-card__label">Progress</span>
        <h2 id="practice-progress-title" class="dashboard-card__title">Track your progress</h2>
        <p id="practice-progress-desc" class="dashboard-card__desc">
          Stars, streaks, and achievements unlock when you create a free account.
        </p>
      </div>

      <div class="dashboard-card__aside dashboard-card__aside--locked">
        <div class="dashboard-card__lock-preview" aria-hidden="true">
          <StarCounter count={0} variant="regular" />
          <StarCounter count={0} variant="special" />
          <StarCounter count={0} variant="bothWays" />
        </div>
        <a class="btn-primary dashboard-card__locked-action" href="/register">
          Create free account
        </a>
        <span class="sr-only">Requires a registered account to unlock progress tracking.</span>
      </div>
    </article>
  </nav>
</section>
