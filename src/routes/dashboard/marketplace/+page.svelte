<script lang="ts">

  import MarketplaceView from '$lib/components/marketplace/MarketplaceView.svelte';

  import SeoHead from '$lib/components/SeoHead.svelte';

  import { loginHref } from '$lib/utils/loginRedirect';

  import { SEO_DESCRIPTIONS } from '$lib/utils/seo';

  import type { PageData } from './$types';



  let { data }: { data: PageData } = $props();

</script>



<SeoHead

  title="Deck marketplace"

  description={SEO_DESCRIPTIONS.dashboardMarketplace}

  noindex={true}

/>



<MarketplaceView

  backHref="/dashboard/library"

  libraryHref="/dashboard/library"

  exerciseHref="/dashboard/exercise"

  canRate={true}

  canPublish={true}

  loginHref={loginHref('/dashboard/marketplace')}

  initialListings={data.listings}

/>

