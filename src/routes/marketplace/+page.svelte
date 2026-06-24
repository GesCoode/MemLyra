<script lang="ts">

  import MarketplaceView from '$lib/components/marketplace/MarketplaceView.svelte';

  import SeoHead from '$lib/components/SeoHead.svelte';

  import { loginHref } from '$lib/utils/loginRedirect';

  import {

    buildMarketplaceIndexDescription,

    buildMarketplaceIndexJsonLd,

    buildMarketplaceIndexTitle

  } from '$lib/utils/marketplaceSeo';

  import type { PageData } from './$types';



  let { data }: { data: PageData } = $props();



  const indexJsonLd = $derived(buildMarketplaceIndexJsonLd(data.listings, data.appUrl));

</script>



<SeoHead

  title={buildMarketplaceIndexTitle()}

  description={buildMarketplaceIndexDescription()}

  path="/marketplace"

  siteUrl={data.appUrl}

  includeBrand={false}

  jsonLd={indexJsonLd}

/>



<MarketplaceView

  backHref="/"

  libraryHref={data.user ? '/dashboard/library' : '/try/library'}

  exerciseHref={data.user ? '/dashboard/exercise' : '/try/exercise'}

  canRate={data.user !== null}

  canPublish={data.user !== null}

  loginHref={loginHref('/marketplace')}

  initialListings={data.listings}

/>

