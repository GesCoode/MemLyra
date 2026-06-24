<script lang="ts">
  import WordLibrary from '$lib/components/library/WordLibrary.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { SEO_DESCRIPTIONS } from '$lib/utils/seo';
</script>

<SeoHead title="Flashcard library" description={SEO_DESCRIPTIONS.dashboardLibrary} noindex={true} />

<section class="page-content">
  <a class="btn-text-link" href="/dashboard">← Back to dashboard</a>

  <div class="library-header">
    <h1 class="library-header__title">Flashcard library</h1>
    <p class="library-header__desc">Manage your flashcards, decks, tags, and imports in one place.</p>
  </div>

  <div class="library-stack">
    <WordLibrary marketplaceHref="/dashboard/marketplace" />
  </div>
</section>