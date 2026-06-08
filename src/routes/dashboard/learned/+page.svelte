<script lang="ts">
  import AchievementsSection from '$lib/components/AchievementsSection.svelte';
  import LearnedProgressChart from '$lib/components/LearnedProgressChart.svelte';
  import StarCounter from '$lib/components/StarCounter.svelte';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import { getAccountStartDate, user } from '$lib/stores/auth';
  import { bothWaysCount, flashcards, learnedCount, masteredCount } from '$lib/stores/flashcards';
  import { isLearnedCard } from '$lib/utils/learnedProgress';

  let accountStart = $derived(getAccountStartDate($user));
  let learnedCards = $derived($flashcards.filter((card) => isLearnedCard(card)));
  let hasLearnedCards = $derived(learnedCards.length > 0);
</script>

<svelte:head>
  <title>Progress · MemLyra</title>
</svelte:head>

<section class="page-content">
  <a class="btn-text-link" href="/dashboard">← Back to dashboard</a>

  <div class="progress-header">
    <div class="library-header mt-8">
      <h1 class="library-header__title">Progress</h1>
      <p class="library-header__desc">
        Track achievements, learning streaks, and flashcards you have earned stars for.
      </p>
    </div>

    <div class="progress-header__stats">
      <StarCounter count={$learnedCount} variant="regular" />
      <StarCounter count={$masteredCount} variant="special" />
      <StarCounter count={$bothWaysCount} variant="bothWays" />
    </div>
  </div>

  <div class="progress-stack">
    <AchievementsSection cards={$flashcards} />

    <div class="glass-panel p-5 sm:p-6">
      <LearnedProgressChart cards={$flashcards} startDate={accountStart} />
    </div>

    {#if !hasLearnedCards}
      <div class="glass-panel p-8 text-center">
        <p class="text-muted">No learned flashcards yet. Complete exercises to earn your first star.</p>
      </div>
    {:else}
      <div class="learned-words-section glass-panel p-5 sm:p-6">
        <h2 class="learned-words-section__title">Learned flashcards</h2>
        <ul class="learned-words-section__list">
          {#each learnedCards as card (card.id)}
            <li class="learned-words-section__item">
              <div class="learned-words-section__pair">
                <span class="learned-words-section__word">{card.sideA}</span>
                <span class="learned-words-section__arrow" aria-hidden="true">→</span>
                <span class="learned-words-section__word">{card.sideB}</span>
              </div>

              <div class="learned-words-section__badges">
                {#if card.bothWaysStar}
                  <span class="learned-words-section__badge learned-words-section__badge-bothways">
                    <StarIcon variant="bothWays" class="h-4 w-4" />
                    Both ways
                  </span>
                {/if}
                {#if card.specialStar}
                  <span class="learned-words-section__badge learned-words-section__badge-mastered">
                    <StarIcon variant="special" class="h-4 w-4" />
                    Mastered
                  </span>
                {/if}
                {#if card.star}
                  <span class="learned-words-section__badge learned-words-section__badge-learned">
                    <StarIcon variant="regular" class="h-4 w-4" />
                    Learned
                  </span>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</section>
