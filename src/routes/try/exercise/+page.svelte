<script lang="ts">
  import { goto } from '$app/navigation';
  import ExerciseSession from '$lib/components/exercise/ExerciseSession.svelte';
  import ExerciseSetup from '$lib/components/exercise/ExerciseSetup.svelte';
  import { PRACTICE_HUB_TITLE } from '$lib/app';
  import { decks } from '$lib/stores/decks';
  import { flashcards } from '$lib/stores/flashcards';
  import { tags } from '$lib/stores/tags';
  import { exerciseSessionActive } from '$lib/stores/exerciseUi';
  import { cloneExerciseSession, type ExerciseSettings, type SessionCard } from '$lib/utils/exercise';

  let activeSession = $state<SessionCard[] | null>(null);
  let activeSettings = $state<ExerciseSettings | null>(null);
  let savedSessionSnapshot = $state<SessionCard[] | null>(null);
  let sessionKey = $state(0);

  function handleStart(session: SessionCard[], settings: ExerciseSettings) {
    activeSession = session;
    activeSettings = settings;
    savedSessionSnapshot = cloneExerciseSession(session);
    sessionKey += 1;
  }

  function handleExit() {
    activeSession = null;
    activeSettings = null;
    savedSessionSnapshot = null;
  }

  function handleTryAgain() {
    if (!savedSessionSnapshot?.length) return;
    activeSession = cloneExerciseSession(savedSessionSnapshot);
    sessionKey += 1;
  }

  function handleHub() {
    goto('/try');
  }
</script>

<svelte:head>
  <title>Start exercise · MemLyra</title>
</svelte:head>

<section class="page-content" class:page-content--exercise={$exerciseSessionActive}>
  {#if activeSession && activeSettings}
    {#key sessionKey}
      <ExerciseSession
        session={activeSession}
        settings={activeSettings}
        pool={$flashcards}
        decks={$decks}
        tags={$tags}
        exitLabel="Back to {PRACTICE_HUB_TITLE}"
        onExit={handleExit}
        onTryAgain={handleTryAgain}
        onDashboard={handleHub}
      />
    {/key}
  {:else}
    <div class="exercise-page">
      <a class="btn-text-link" href="/try" aria-label="Back to {PRACTICE_HUB_TITLE}">← Back</a>

      <h1 class="library-header__title exercise-page__header">Start exercise</h1>

      <ExerciseSetup
        cards={$flashcards}
        decks={$decks}
        tags={$tags}
        hideDeckFilter
        libraryHref="/try/library"
        onStart={handleStart}
      />
    </div>
  {/if}
</section>
