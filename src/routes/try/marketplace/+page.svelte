<script lang="ts">

  import MarketplaceView from '$lib/components/marketplace/MarketplaceView.svelte';

  import SeoHead from '$lib/components/SeoHead.svelte';

  import { loginHref } from '$lib/utils/loginRedirect';

  import {

    buildMarketplaceIndexDescription,

    buildMarketplaceIndexTitle

  } from '$lib/utils/marketplaceSeo';

  import type { PageData } from './$types';



  let { data }: { data: PageData } = $props();

</script>



<SeoHead

  title={buildMarketplaceIndexTitle()}

  description={buildMarketplaceIndexDescription()}

  path="/try/marketplace"

  canonicalPath="/marketplace"

  includeBrand={false}

/>



<MarketplaceView

  backHref="/try/library"

  libraryHref="/try/library"

  exerciseHref="/try/exercise"

  canRate={data.user !== null}

  canPublish={data.user !== null}

  loginHref={loginHref('/try/marketplace')}

  initialListings={data.listings}

/>

