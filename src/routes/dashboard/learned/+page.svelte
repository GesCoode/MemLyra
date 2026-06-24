<script lang="ts">
  import AchievementsSection from '$lib/components/AchievementsSection.svelte';
  import LearnedFlashcardsList from '$lib/components/LearnedFlashcardsList.svelte';
  import LearnedProgressChart from '$lib/components/LearnedProgressChart.svelte';
  import StarCounter from '$lib/components/StarCounter.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { getAccountStartDate, user } from '$lib/stores/auth';
  import { decks } from '$lib/stores/decks';
  import { bothWaysCount, flashcards, learnedCount, masteredCount } from '$lib/stores/flashcards';
  import { tags } from '$lib/stores/tags';
  import { isLearnedCard } from '$lib/utils/learnedProgress';
  import { SEO_DESCRIPTIONS } from '$lib/utils/seo';

  let accountStart = $derived(getAccountStartDate($user));
  let learnedCards = $derived($flashcards.filter((card) => isLearnedCard(card)));
  let hasLearnedCards = $derived(learnedCards.length > 0);
</script>

<SeoHead title="Progress" description={SEO_DESCRIPTIONS.dashboardLearned} noindex={true} />

<section class="page-content progress-page">
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
      <div class="glass-panel p-5 sm:p-6">
        <LearnedFlashcardsList cards={learnedCards} decks={$decks} tags={$tags} />
      </div>
    {/if}
  </div>
</section>
