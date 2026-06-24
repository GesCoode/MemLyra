<script lang="ts">
  import { onMount } from 'svelte';
  import WordLibrary from '$lib/components/library/WordLibrary.svelte';

  import SeoHead from '$lib/components/SeoHead.svelte';

  import { PRACTICE_HUB_TITLE } from '$lib/app';

  import { loadFlashcards } from '$lib/stores/flashcards';

  import { SEO_DESCRIPTIONS } from '$lib/utils/seo';



  onMount(() => {

    void loadFlashcards();

  });

</script>



<SeoHead

  title="Flashcard library"

  description={SEO_DESCRIPTIONS.tryLibrary}

  path="/try/library"

/>



<section class="page-content">

  <div class="exercise-page">

    <a class="btn-text-link" href="/try" aria-label="Back to {PRACTICE_HUB_TITLE}">← Back</a>



    <h1 class="library-header__title exercise-page__header">Flashcard library</h1>

    <div class="library-stack library-stack--after-subpage-header">

      <WordLibrary hideProgress hideDecks marketplaceHref="/marketplace" />

    </div>

  </div>

</section>

