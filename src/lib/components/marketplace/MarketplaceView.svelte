<script lang="ts">
  import ManageListingDialog from '$lib/components/marketplace/ManageListingDialog.svelte';
  import MarketplaceDeckImportDialog from '$lib/components/marketplace/MarketplaceDeckImportDialog.svelte';
  import MarketplaceDeckPreviewDialog from '$lib/components/marketplace/MarketplaceDeckPreviewDialog.svelte';
  import PublishDeckDialog from '$lib/components/marketplace/PublishDeckDialog.svelte';
  import PublishIcon from '$lib/components/icons/PublishIcon.svelte';
  import {
    fetchMarketplaceDecks,
    fetchMyMarketplaceListings,
    type MarketplaceDeckSummary
  } from '$lib/stores/marketplace';
  import {
    filterMarketplaceDecks,
    formatMarketplaceRating,
    marketplaceDeckPath,
    sortMarketplaceDecks,
    type MarketplaceSortDirection,
    type MarketplaceSortField
  } from '$lib/utils/marketplace';
  import { deckIndexStyle } from '$lib/utils/tagColors';

  type MarketplaceTab = 'browse' | 'mine';
  type ImportSuccess = {
    message: string;
    deckName: string;
  };

  let {
    backHref,
    libraryHref,
    exerciseHref = '/try/exercise',
    canRate = false,
    canPublish = false,
    loginHref = '/login',
    initialListings
  }: {
    backHref: string;
    libraryHref: string;
    exerciseHref?: string;
    canRate?: boolean;
    canPublish?: boolean;
    loginHref?: string;
    initialListings: MarketplaceDeckSummary[];
  } = $props();

  let listings = $state<MarketplaceDeckSummary[]>([]);
  let myListings = $state<MarketplaceDeckSummary[]>([]);
  let activeTab = $state<MarketplaceTab>('browse');
  let loadingMine = $state(false);
  let listError = $state('');
  let publishDialogOpen = $state(false);
  let publishMessage = $state('');
  let importSuccess = $state<ImportSuccess | null>(null);
  let searchQuery = $state('');
  let sortField = $state<MarketplaceSortField>('date');
  let sortDirection = $state<MarketplaceSortDirection>('desc');
  let previewDeckId = $state<string | null>(null);
  let importDeck = $state<MarketplaceDeckSummary | null>(null);
  let manageListing = $state<MarketplaceDeckSummary | null>(null);

  let visibleListings = $derived(
    sortMarketplaceDecks(
      filterMarketplaceDecks(listings, searchQuery),
      sortField,
      sortDirection
    )
  );

  let visibleMyListings = $derived(
    sortMarketplaceDecks(
      filterMarketplaceDecks(myListings, searchQuery),
      sortField,
      sortDirection
    )
  );

  $effect(() => {
    listings = initialListings;
  });

  $effect(() => {
    if (activeTab === 'mine' && canPublish && myListings.length === 0 && !loadingMine) {
      void loadMyListings();
    }
  });

  async function loadMyListings() {
    loadingMine = true;
    listError = '';

    try {
      myListings = await fetchMyMarketplaceListings();
    } catch {
      listError = 'Could not load your listings.';
      myListings = [];
    } finally {
      loadingMine = false;
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
    myListings = myListings.map((item) => (item.id === deck.id ? { ...item, ...deck } : item));
  }

  async function handlePublished(message: string) {
    publishMessage = message;
    publishDialogOpen = false;
    listings = await fetchMarketplaceDecks();
    myListings = await fetchMyMarketplaceListings();
  }

  function handleImported(result: ImportSuccess) {
    importSuccess = result;
  }

  function handleListingUpdated(deck: MarketplaceDeckSummary, message: string) {
    updateListing(deck);
    publishMessage = message;
  }

  function handleListingRemoved(message: string) {
    myListings = myListings.filter((item) => item.id !== manageListing?.id);
    listings = listings.filter((item) => item.id !== manageListing?.id);
    publishMessage = message;
    manageListing = null;
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
          Publish your own decks from the panel below.
        {/if}
      </p>
    </div>
    <a class="btn-secondary" href={libraryHref}>Go to library</a>
  </header>

  {#if publishMessage}
    <p class="library-message library-message-success marketplace-page__banner">{publishMessage}</p>
  {/if}

  {#if importSuccess}
    <div class="library-message library-message-success marketplace-page__banner marketplace-page__import-success">
      <p>{importSuccess.message}</p>
      <div class="marketplace-page__import-success-actions">
        <a class="btn-secondary" href={libraryHref}>Open library</a>
        <a class="btn-primary" href={exerciseHref}>Start practicing</a>
      </div>
    </div>
  {/if}

  <section class="marketplace-page__panel" aria-labelledby="marketplace-panel-heading">
    <div class="marketplace-page__panel-header">
      <div class="marketplace-page__tabs" role="tablist" aria-label="Marketplace views">
        <button
          class="marketplace-page__tab"
          class:marketplace-page__tab--active={activeTab === 'browse'}
          type="button"
          role="tab"
          aria-selected={activeTab === 'browse'}
          onclick={() => (activeTab = 'browse')}
        >
          Available decks
        </button>
        {#if canPublish}
          <button
            class="marketplace-page__tab"
            class:marketplace-page__tab--active={activeTab === 'mine'}
            type="button"
            role="tab"
            aria-selected={activeTab === 'mine'}
            onclick={() => (activeTab = 'mine')}
          >
            Your listings
          </button>
        {/if}
      </div>

      {#if canPublish}
        <button class="btn-publish" type="button" onclick={() => (publishDialogOpen = true)}>
          <PublishIcon class="btn-publish__icon" />
          Publish deck
        </button>
      {/if}
    </div>

    <h2 id="marketplace-panel-heading" class="sr-only">
      {activeTab === 'browse' ? 'Available decks' : 'Your listings'}
    </h2>

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

    {#if activeTab === 'browse'}
      {#if listings.length === 0}
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
                  <a class="marketplace-page__deck-title marketplace-page__deck-title-link" href={marketplaceDeckPath(deck)}>
                    {deck.title}
                  </a>
                  <span class="marketplace-page__deck-meta">
                    {deck.cardCount} card{deck.cardCount === 1 ? '' : 's'} · {formatMarketplaceRating(deck.averageRating, deck.ratingCount)}
                  </span>
                  <span class="marketplace-page__deck-author">by {deck.publisherName}</span>
                </div>
              </div>

              <div class="marketplace-page__deck-actions">
                <button class="btn-secondary" type="button" onclick={() => openPreview(deck.id)}>Preview</button>
                <button class="btn-marketplace" type="button" onclick={() => openImport(deck)}>Import</button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    {:else if loadingMine}
      <p class="marketplace-page__status">Loading your listings…</p>
    {:else if listError}
      <p class="library-message library-message-error">{listError}</p>
      <button class="btn-secondary" type="button" onclick={loadMyListings}>Try again</button>
    {:else if myListings.length === 0}
      <div class="marketplace-page__empty">
        <p>You have not published any decks yet.</p>
        <button class="btn-publish" type="button" onclick={() => (publishDialogOpen = true)}>
          <PublishIcon class="btn-publish__icon" />
          Publish deck
        </button>
      </div>
    {:else if visibleMyListings.length === 0}
      <div class="marketplace-page__empty">
        <p>No listings match your search.</p>
        <button class="btn-text-link" type="button" onclick={() => (searchQuery = '')}>Clear search</button>
      </div>
    {:else}
      <ul class="marketplace-page__deck-list">
        {#each visibleMyListings as deck (deck.id)}
          <li class="marketplace-page__deck-row">
            <div class="marketplace-page__deck-info">
              <span class="marketplace-page__swatch" style={deckIndexStyle(deck.color)} aria-hidden="true"></span>
              <div class="marketplace-page__deck-copy">
                <a class="marketplace-page__deck-title marketplace-page__deck-title-link" href={marketplaceDeckPath(deck)}>
                  {deck.title}
                </a>
                <span class="marketplace-page__deck-meta">
                  {deck.cardCount} card{deck.cardCount === 1 ? '' : 's'} · {formatMarketplaceRating(deck.averageRating, deck.ratingCount)}
                </span>
                {#if deck.description}
                  <span class="marketplace-page__deck-desc">{deck.description}</span>
                {/if}
              </div>
            </div>

            <div class="marketplace-page__deck-actions">
              <button class="btn-secondary" type="button" onclick={() => openPreview(deck.id)}>Preview</button>
              <button class="btn-secondary" type="button" onclick={() => (manageListing = deck)}>Manage</button>
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

<ManageListingDialog
  open={manageListing !== null}
  listing={manageListing}
  onClose={() => (manageListing = null)}
  onUpdated={handleListingUpdated}
  onRemoved={handleListingRemoved}
/>
