<script lang="ts">
  import StarCounter from '$lib/components/StarCounter.svelte';
  import { user } from '$lib/stores/auth';
  import { bothWaysCount, learnedCount, masteredCount } from '$lib/stores/flashcards';

  const sections = [
    {
      href: '/dashboard/exercise',
      title: 'Start exercise',
      description: 'Pick a tag and practice your flashcards.',
      theme: 'exercise',
      label: 'Practice',
      showCount: false
    },
    {
      href: '/dashboard/library',
      title: 'Flashcard library',
      description: 'Add flashcards, manage tags, and organize your collection.',
      theme: 'library',
      label: 'Collection',
      showCount: false
    },
    {
      href: '/dashboard/learned',
      title: 'Progress',
      description: 'Track achievements, streaks, and flashcards you have earned stars for.',
      theme: 'learned',
      label: 'Progress',
      showCount: true
    }
  ] as const;
</script>

<svelte:head>
  <title>Dashboard · MemLyra</title>
</svelte:head>

<section class="page-content">
  <div class="library-header mt-0">
    <h1 class="library-header__title">
      Welcome, <span class="library-header__name">{$user?.name}</span>.
    </h1>
    <p class="library-header__desc">Ready to exercise? Pick a section below to continue.</p>
  </div>

  <div class="mt-10 grid gap-5">
    {#each sections as section}
      <a class="dashboard-card dashboard-card-{section.theme} group" href={section.href}>
        <div class="dashboard-card__icon" aria-hidden="true">
          {#if section.theme === 'exercise'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M8 5v14l11-7L8 5z" stroke-linejoin="round" />
            </svg>
          {:else if section.theme === 'library'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M4 6h16M4 12h16M4 18h10" stroke-linecap="round" />
              <path d="M18 18h2v-3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
              />
            </svg>
          {/if}
        </div>

        <div class="dashboard-card__body">
          <span class="dashboard-card__label">{section.label}</span>
          <h2 class="dashboard-card__title">{section.title}</h2>
          <p class="dashboard-card__desc">{section.description}</p>
        </div>

        <div class="dashboard-card__aside">
          {#if section.showCount}
            <div class="flex items-center gap-2">
              <StarCounter count={$learnedCount} variant="regular" />
              <StarCounter count={$masteredCount} variant="special" />
              <StarCounter count={$bothWaysCount} variant="bothWays" />
            </div>
          {:else}
            <span class="dashboard-card__arrow">→</span>
          {/if}
        </div>
      </a>
    {/each}
  </div>
</section>
