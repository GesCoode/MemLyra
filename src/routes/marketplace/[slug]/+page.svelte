<script lang="ts">

  import MarketplaceDeckDetailView from '$lib/components/marketplace/MarketplaceDeckDetailView.svelte';

  import SeoHead from '$lib/components/SeoHead.svelte';

  import { marketplaceDeckPath } from '$lib/utils/marketplace';

  import { loginHref } from '$lib/utils/loginRedirect';

  import {

    buildBreadcrumbJsonLd,

    buildMarketplaceDeckDescription,

    buildMarketplaceDeckJsonLd,

    buildMarketplaceDeckTitle,

    marketplaceDeckUrl,

    marketplaceIndexUrl

  } from '$lib/utils/marketplaceSeo';

  import { absoluteUrl } from '$lib/utils/seo';

  import type { PageData } from './$types';



  let { data }: { data: PageData } = $props();



  const deck = $derived(data.deck);

  const pageTitle = $derived(buildMarketplaceDeckTitle(deck));

  const description = $derived(buildMarketplaceDeckDescription(deck));

  const deckJsonLd = $derived(buildMarketplaceDeckJsonLd(deck, data.appUrl));

  const breadcrumbJsonLd = $derived(

    buildBreadcrumbJsonLd([

      { name: 'Home', url: absoluteUrl('/', data.appUrl) },

      { name: 'Marketplace', url: marketplaceIndexUrl(data.appUrl) },

      { name: deck.title, url: marketplaceDeckUrl(deck, data.appUrl) }

    ])

  );

</script>



<SeoHead

  title={pageTitle}

  description={description}

  path={marketplaceDeckPath(deck)}

  siteUrl={data.appUrl}

  ogType="article"

  ogTitle={deck.title}

  articlePublishedTime={deck.publishedAt}

  articleModifiedTime={deck.updatedAt}

  includeBrand={false}

  jsonLd={[deckJsonLd, breadcrumbJsonLd]}

/>



<MarketplaceDeckDetailView

  {deck}

  canRate={data.user !== null}

  canImport={true}

  isGuest={data.user === null}

  libraryHref={data.user ? '/dashboard/library' : '/try/library'}

  exerciseHref={data.user ? '/dashboard/exercise' : '/try/exercise'}

  loginHref={loginHref(marketplaceDeckPath(deck))}

/>

