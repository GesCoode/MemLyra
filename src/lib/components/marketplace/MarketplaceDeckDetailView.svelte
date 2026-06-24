<script lang="ts">

  import MarketplaceDeckImportDialog from '$lib/components/marketplace/MarketplaceDeckImportDialog.svelte';

  import MarketplaceStarRating from '$lib/components/marketplace/MarketplaceStarRating.svelte';

  import { rateMarketplaceDeck, type MarketplaceDeckDetail } from '$lib/stores/marketplace';

  import { downloadMarketplaceDeckCsv } from '$lib/utils/exportMarketplaceDeck';

  import { formatMarketplaceRating } from '$lib/utils/marketplace';

  import { formatMarketplaceDate } from '$lib/utils/marketplaceSeo';

  import { loginHref } from '$lib/utils/loginRedirect';

  import { deckIndexStyle } from '$lib/utils/tagColors';



  let {

    deck: initialDeck,

    canRate = false,

    canImport = true,

    isGuest = false,

    homeHref = '/',

    homeLabel = 'Home',

    marketplaceHref = '/marketplace',

    marketplaceLabel = 'Marketplace',

    loginHref: loginHrefOverride,

    libraryHref = '/dashboard/library',

    exerciseHref = '/dashboard/exercise'

  }: {

    deck: MarketplaceDeckDetail;

    canRate?: boolean;

    canImport?: boolean;

    isGuest?: boolean;

    homeHref?: string;

    homeLabel?: string;

    marketplaceHref?: string;

    marketplaceLabel?: string;

    loginHref?: string;

    libraryHref?: string;

    exerciseHref?: string;

  } = $props();



  const resolvedLoginHref = $derived(loginHrefOverride ?? loginHref(marketplaceHref));



  let ratingPatch = $state<Partial<MarketplaceDeckDetail> | null>(null);

  let importDialogOpen = $state(false);

  let importSuccess = $state<{ message: string; deckName: string } | null>(null);

  let ratingMessage = $state('');

  let ratingIsError = $state(false);

  let ratingSaving = $state(false);



  let deck = $derived(

    ratingPatch ? ({ ...initialDeck, ...ratingPatch } as MarketplaceDeckDetail) : initialDeck

  );



  async function handleRate(rating: number) {

    if (!canRate || ratingSaving) return;



    ratingSaving = true;

    ratingMessage = '';

    ratingIsError = false;



    const result = await rateMarketplaceDeck(deck.id, rating);

    ratingSaving = false;



    if (result.error) {

      ratingMessage = result.error;

      ratingIsError = true;

      return;

    }



    if (result.deck) {

      ratingPatch = result.deck;

      ratingMessage = 'Thanks for rating this deck.';

      ratingIsError = false;

    }

  }



  function handleImported(result: { message: string; deckName: string }) {

    importSuccess = result;

    importDialogOpen = false;

  }



  function handleDownload() {

    downloadMarketplaceDeckCsv(deck);

  }

</script>



<article class="page-content marketplace-deck-page" itemscope itemtype="https://schema.org/LearningResource">

  <nav class="marketplace-deck-page__breadcrumb" aria-label="Breadcrumb">

    <ol class="marketplace-deck-page__breadcrumb-list">

      <li><a href={homeHref}>{homeLabel}</a></li>

      <li><a href={marketplaceHref}>{marketplaceLabel}</a></li>

      <li aria-current="page">{deck.title}</li>

    </ol>

  </nav>



  {#if importSuccess}

    <div class="library-message library-message-success marketplace-page__banner marketplace-page__import-success">

      <p>{importSuccess.message}</p>
      {#if isGuest}
        <p class="marketplace-detail__hint">Guest imports stay on this device until you register.</p>
      {/if}

      <div class="marketplace-page__import-success-actions">

        <a class="btn-secondary" href={libraryHref}>Open library</a>

        <a class="btn-primary" href={exerciseHref}>Start practicing</a>

      </div>

    </div>

  {/if}



  <header class="marketplace-detail__header marketplace-deck-page__header">

    <div>

      <h1 class="marketplace-detail__title" itemprop="name">{deck.title}</h1>

      <p class="marketplace-detail__meta">

        by <span itemprop="author">{deck.publisherName}</span> ·

        {deck.cardCount} card{deck.cardCount === 1 ? '' : 's'} · Published

        <time datetime={deck.publishedAt} itemprop="datePublished">

          {formatMarketplaceDate(deck.publishedAt)}

        </time>

      </p>

    </div>

    <span class="marketplace-detail__badge" style={deckIndexStyle(deck.color)}>Deck</span>

  </header>



  {#if deck.description}

    <p class="marketplace-detail__desc" itemprop="description">{deck.description}</p>

  {/if}



  <div class="marketplace-detail__stats">

    <div class="marketplace-detail__stat">

      <span class="marketplace-detail__stat-label">Average rating</span>

      <div class="marketplace-detail__rating-row">

        <MarketplaceStarRating value={deck.averageRating} />

        <span class="marketplace-detail__rating-text">

          {formatMarketplaceRating(deck.averageRating, deck.ratingCount)}

        </span>

      </div>

    </div>



    <div class="marketplace-detail__stat">

      <span class="marketplace-detail__stat-label">Your rating</span>

      {#if canRate}

        <MarketplaceStarRating

          value={deck.userRating ?? 0}

          interactive

          disabled={ratingSaving}

          label="Rate this deck"

          onChange={handleRate}

        />

        {#if ratingMessage}

          <p

            class="marketplace-detail__hint"

            class:marketplace-detail__hint--success={!ratingIsError}

            class:marketplace-detail__hint--error={ratingIsError}

          >

            {ratingMessage}

          </p>

        {/if}

      {:else}

        <p class="marketplace-detail__hint">

          <a class="btn-text-link" href={resolvedLoginHref}>Log in</a> to rate decks.

        </p>

      {/if}

    </div>

  </div>



  <section class="marketplace-detail__preview" aria-labelledby="marketplace-deck-cards-heading">

    <div class="marketplace-detail__preview-header">

      <h2 id="marketplace-deck-cards-heading" class="marketplace-detail__preview-title">

        All {deck.cardCount} card{deck.cardCount === 1 ? '' : 's'}

      </h2>

      <button

        class="btn-ghost marketplace-detail__download-btn library-action-btn"

        type="button"

        onclick={handleDownload}

        disabled={deck.cards.length === 0}

      >

        <svg

          class="library-action-btn__icon"

          viewBox="0 0 24 24"

          fill="none"

          stroke="currentColor"

          stroke-width="1.75"

          stroke-linecap="round"

          stroke-linejoin="round"

          aria-hidden="true"

        >

          <path d="M12 3v12" />

          <path d="m7 10 5 5 5-5" />

          <path d="M5 21h14" />

        </svg>

        Download CSV

      </button>

    </div>



    <div class="marketplace-detail__table-wrap">

      <table class="marketplace-detail__table">

        <thead>

          <tr>

            <th scope="col">Side A</th>

            <th scope="col">Side B</th>

          </tr>

        </thead>

        <tbody>

          {#each deck.cards as card}

            <tr>

              <td>{card.sideA}</td>

              <td>{card.sideB}</td>

            </tr>

          {/each}

        </tbody>

      </table>

    </div>

  </section>



  {#if canImport}

    <section class="marketplace-detail__import" aria-labelledby="marketplace-deck-import-heading">

      <h2 id="marketplace-deck-import-heading" class="marketplace-detail__import-title">

        Import this deck

      </h2>

      <p class="marketplace-detail__hint">

        Add all {deck.cardCount} cards to your library and start practicing right away.

      </p>

      <div class="marketplace-deck-page__import-actions">

        <button class="btn-marketplace" type="button" onclick={() => (importDialogOpen = true)}>

          Import {deck.cardCount} card{deck.cardCount === 1 ? '' : 's'}

        </button>

        <a class="btn-secondary" href={libraryHref}>Go to library</a>

      </div>

    </section>

  {/if}

</article>



<MarketplaceDeckImportDialog

  open={importDialogOpen}

  deckId={deck.id}

  defaultTitle={deck.title}

  cardCount={deck.cardCount}

  onClose={() => (importDialogOpen = false)}

  onImported={handleImported}

/>

