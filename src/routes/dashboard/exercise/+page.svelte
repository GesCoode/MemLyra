<script lang="ts">
  import { goto } from '$app/navigation';
  import ExerciseSession from '$lib/components/exercise/ExerciseSession.svelte';
  import ExerciseSetup from '$lib/components/exercise/ExerciseSetup.svelte';
  import { decks } from '$lib/stores/decks';
  import { flashcards } from '$lib/stores/flashcards';
  import { tags } from '$lib/stores/tags';
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

  function handleDashboard() {
    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Start exercise · MemLyra</title>
</svelte:head>

<section class="page-content" class:page-content--exercise={activeSession !== null}>
  {#if activeSession && activeSettings}
    {#key sessionKey}
      <ExerciseSession
        session={activeSession}
        settings={activeSettings}
        pool={$flashcards}
        decks={$decks}
        tags={$tags}
        onExit={handleExit}
        onTryAgain={handleTryAgain}
        onDashboard={handleDashboard}
      />
    {/key}
  {:else}
    <a class="btn-text-link" href="/dashboard">← Back to dashboard</a>

    <div class="library-header mt-8">
      <h1 class="library-header__title">Start exercise</h1>
      <p class="library-header__desc">
        Filter your flashcards, pick a quiz style, and practice with animated cards.
      </p>
    </div>

    <div class="exercise-page">
      <ExerciseSetup
        cards={$flashcards}
        decks={$decks}
        tags={$tags}
        onStart={handleStart}
      />
    </div>
  {/if}
</section>
