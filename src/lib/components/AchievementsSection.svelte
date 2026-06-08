<script lang="ts">
  import type { Flashcard } from '$lib/stores/flashcards';
  import { evaluateAchievements, type AchievementStatus } from '$lib/utils/achievements';

  let { cards = [] }: { cards?: Flashcard[] } = $props();

  let achievements = $derived(evaluateAchievements(cards));
  let unlockedCount = $derived(achievements.filter((achievement) => achievement.unlocked).length);

  function progressLabel(achievement: AchievementStatus): string {
    if (achievement.unlocked) return 'Unlocked';
    return `${achievement.current} / ${achievement.threshold}`;
  }
</script>

<section class="achievements-section glass-panel p-5 sm:p-6">
  <div class="achievements-section__header">
    <div>
      <h2 class="achievements-section__title">Achievements</h2>
      <p class="achievements-section__desc">
        {unlockedCount} of {achievements.length} unlocked
      </p>
    </div>
  </div>

  <ul class="achievements-grid">
    {#each achievements as achievement (achievement.id)}
      <li
        class="achievement-card achievement-card-{achievement.category}"
        class:achievement-card-unlocked={achievement.unlocked}
      >
        <div class="achievement-card__icon" aria-hidden="true">
          {#if achievement.category === 'learned'}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2.5l2.6 5.9 6.4.6-4.8 4.2 1.5 6.3L12 16.8 6.3 19.5l1.5-6.3-4.8-4.2 6.4-.6L12 2.5z"
              />
            </svg>
          {:else if achievement.category === 'mastered'}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 1.8l2.9 6.6 7.1.7-5.4 4.7 1.7 7L12 17.2 5.7 20.8l1.7-7L2 9.1l7.1-.7L12 1.8z"
              />
              <circle cx="12" cy="12" r="3.2" fill="#0d1424" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M4 14h2l2-4 3 8 3-10 2 4h2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {/if}
        </div>

        <div class="achievement-card__body">
          <h3 class="achievement-card__title">{achievement.title}</h3>
          <p class="achievement-card__desc">{achievement.description}</p>

          <div class="achievement-card__progress-wrap">
            <div class="achievement-card__progress-track">
              <div
                class="achievement-card__progress-fill"
                style="width: {achievement.progress * 100}%"
              ></div>
            </div>
            <span class="achievement-card__progress-label">{progressLabel(achievement)}</span>
          </div>
        </div>
      </li>
    {/each}
  </ul>
</section>
