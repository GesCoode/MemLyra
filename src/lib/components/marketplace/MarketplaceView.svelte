<script lang="ts">

  import { onMount } from 'svelte';

  import MarketplaceDeckImportDialog from '$lib/components/marketplace/MarketplaceDeckImportDialog.svelte';

  import MarketplaceDeckPreviewDialog from '$lib/components/marketplace/MarketplaceDeckPreviewDialog.svelte';

  import PublishDeckDialog from '$lib/components/marketplace/PublishDeckDialog.svelte';

  import {

    fetchMarketplaceDecks,

    type MarketplaceDeckSummary

  } from '$lib/stores/marketplace';

  import {

    filterMarketplaceDecks,

    formatMarketplaceRating,

    sortMarketplaceDecks,

    type MarketplaceSortDirection,

    type MarketplaceSortField

  } from '$lib/utils/marketplace';

  import { deckIndexStyle } from '$lib/utils/tagColors';



  let {

    backHref,

    libraryHref,

    canRate = false,

    canPublish = false,

    loginHref = '/login'

  }: {

    backHref: string;

    libraryHref: string;

    canRate?: boolean;

    canPublish?: boolean;

    loginHref?: string;

  } = $props();



  let listings = $state<MarketplaceDeckSummary[]>([]);

  let loadingList = $state(true);

  let listError = $state('');

  let publishDialogOpen = $state(false);

  let publishMessage = $state('');

  let importMessage = $state('');

  let searchQuery = $state('');

  let sortField = $state<MarketplaceSortField>('date');

  let sortDirection = $state<MarketplaceSortDirection>('desc');

  let previewDeckId = $state<string | null>(null);

  let importDeck = $state<MarketplaceDeckSummary | null>(null);



  let visibleListings = $derived(

    sortMarketplaceDecks(

      filterMarketplaceDecks(listings, searchQuery),

      sortField,

      sortDirection

    )

  );



  onMount(() => {

    void loadListings();

  });



  async function loadListings() {

    loadingList = true;

    listError = '';



    try {

      listings = await fetchMarketplaceDecks();

    } catch {

      listError = 'Could not load marketplace decks.';

      listings = [];

    } finally {

      loadingList = false;

    }

  }



  function toggleSortDirection() {

    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';

  }



  function openPreview(deckId: string) {

    previewDeckId = deckId;

  }



  function closePreview() {

    previewDeckId = null;

  }



  function openImport(deck: MarketplaceDeckSummary) {

    importDeck = deck;

  }



  function closeImport() {

    importDeck = null;

  }



  function handlePreviewImport(deck: MarketplaceDeckSummary) {

    closePreview();

    openImport(deck);

  }



  function updateListing(deck: MarketplaceDeckSummary) {

    listings = listings.map((item) => (item.id === deck.id ? { ...item, ...deck } : item));

  }



  async function handlePublished(message: string) {

    publishMessage = message;

    publishDialogOpen = false;

    await loadListings();

  }



  function handleImported(message: string) {

    importMessage = message;

  }

</script>



<section class="page-content marketplace-page">

  <a class="btn-text-link" href={backHref}>← Back</a>



  <header class="marketplace-page__header">

    <div>

      <h1 class="library-header__title marketplace-page__title">Deck marketplace</h1>

      <p class="marketplace-page__intro">

        Browse community decks and import them into your library.

        {#if canPublish}

          You can publish your own decks with the button above the list.

        {/if}

      </p>

    </div>

    <a class="btn-secondary" href={libraryHref}>Go to library</a>

  </header>



  {#if publishMessage}

    <p class="library-message library-message-success marketplace-page__banner">{publishMessage}</p>

  {/if}



  {#if importMessage}

    <p class="library-message library-message-success marketplace-page__banner">{importMessage}</p>

  {/if}



  <section class="marketplace-page__panel" aria-labelledby="marketplace-available-heading">

    <div class="marketplace-page__panel-header">

      <h2 id="marketplace-available-heading" class="marketplace-page__panel-title">Available decks</h2>



      {#if canPublish}

        <button class="btn-publish" type="button" onclick={() => (publishDialogOpen = true)}>

          <svg class="btn-publish__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">

            <path d="M12 16V4m0 0 4 4m-4-4-4 4" stroke-linecap="round" stroke-linejoin="round" />

            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke-linecap="round" />

          </svg>

          Publish deck

        </button>

      {/if}

    </div>



    <div class="marketplace-page__toolbar">

      <label class="library-field marketplace-page__search">

        <span class="field-label">Search</span>

        <input

          class="field-input"

          type="search"

          placeholder="Search by name, author, or description"

          bind:value={searchQuery}

        />

      </label>



      <div class="library-sort marketplace-page__sort">

        <label class="library-sort__label" for="marketplace-sort-field">Sort by</label>

        <select

          id="marketplace-sort-field"

          class="field-input library-sort__select"

          bind:value={sortField}

        >

          <option value="date">Date added</option>

          <option value="cards">Card count</option>

          <option value="rating">Rating</option>

          <option value="name">Deck name</option>

        </select>

        <button

          class="library-sort__direction"

          type="button"

          aria-label={sortDirection === 'desc' ? 'Sort descending' : 'Sort ascending'}

          title={sortDirection === 'desc' ? 'Descending — click for ascending' : 'Ascending — click for descending'}

          onclick={toggleSortDirection}

        >

          <svg

            class="library-sort__arrow"

            viewBox="0 0 24 24"

            fill="none"

            stroke="currentColor"

            stroke-width="2.5"

            stroke-linecap="round"

            stroke-linejoin="round"

            aria-hidden="true"

          >

            {#if sortDirection === 'desc'}

              <path d="M12 5v14M7 14l5 5 5-5" />

            {:else}

              <path d="M12 19V5M7 10l5-5 5 5" />

            {/if}

          </svg>

        </button>

      </div>

    </div>



    {#if loadingList}

      <p class="marketplace-page__status">Loading decks…</p>

    {:else if listError}

      <p class="library-message library-message-error">{listError}</p>

      <button class="btn-secondary" type="button" onclick={loadListings}>Try again</button>

    {:else if listings.length === 0}

      <div class="marketplace-page__empty">

        <p>No decks have been published yet.</p>

        {#if canPublish}

          <p class="marketplace-page__empty-hint">

            Click <strong>Publish deck</strong> to share one from your library.

          </p>

        {:else}

          <p class="marketplace-page__empty-hint">

            <a class="btn-text-link" href={loginHref}>Log in</a> to publish decks from your library.

          </p>

        {/if}

      </div>

    {:else if visibleListings.length === 0}

      <div class="marketplace-page__empty">

        <p>No decks match your search.</p>

        <button class="btn-text-link" type="button" onclick={() => (searchQuery = '')}>

          Clear search

        </button>

      </div>

    {:else}

      <ul class="marketplace-page__deck-list">

        {#each visibleListings as deck (deck.id)}

          <li class="marketplace-page__deck-row">

            <div class="marketplace-page__deck-info">

              <span class="marketplace-page__swatch" style={deckIndexStyle(deck.color)} aria-hidden="true"></span>

              <div class="marketplace-page__deck-copy">

                <span class="marketplace-page__deck-title">{deck.title}</span>

                <span class="marketplace-page__deck-meta">

                  {deck.cardCount} card{deck.cardCount === 1 ? '' : 's'} · {formatMarketplaceRating(deck.averageRating, deck.ratingCount)}

                </span>

                <span class="marketplace-page__deck-author">by {deck.publisherName}</span>

              </div>

            </div>



            <div class="marketplace-page__deck-actions">

              <button class="btn-secondary" type="button" onclick={() => openPreview(deck.id)}>

                Preview

              </button>

              <button class="btn-primary" type="button" onclick={() => openImport(deck)}>

                Import

              </button>

            </div>

          </li>

        {/each}

      </ul>

    {/if}

  </section>

</section>



<PublishDeckDialog

  open={publishDialogOpen}

  onClose={() => (publishDialogOpen = false)}

  onPublished={handlePublished}

/>



<MarketplaceDeckPreviewDialog

  open={previewDeckId !== null}

  deckId={previewDeckId}

  {canRate}

  {loginHref}

  onClose={closePreview}

  onImport={handlePreviewImport}

  onUpdated={updateListing}

/>



<MarketplaceDeckImportDialog

  open={importDeck !== null}

  deckId={importDeck?.id ?? null}

  defaultTitle={importDeck?.title ?? ''}

  cardCount={importDeck?.cardCount ?? 0}

  onClose={closeImport}

  onImported={handleImported}

/>


