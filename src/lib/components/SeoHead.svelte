<script lang="ts">
  import { APP_NAME } from '$lib/app';
  import { absoluteUrl, buildPageTitle, jsonLdScript } from '$lib/utils/seo';

  let {
    title,
    description,
    path,
    canonicalPath,
    ogType = 'website',
    ogTitle,
    articlePublishedTime,
    articleModifiedTime,
    siteUrl,
    noindex = false,
    includeBrand = true,
    jsonLd
  }: {
    title: string;
    description?: string;
    path?: string;
    canonicalPath?: string;
    ogType?: 'website' | 'article';
    ogTitle?: string;
    articlePublishedTime?: string;
    articleModifiedTime?: string;
    siteUrl?: string;
    noindex?: boolean;
    includeBrand?: boolean;
    jsonLd?: unknown | unknown[];
  } = $props();

  const fullTitle = $derived(buildPageTitle(title, includeBrand));
  const resolvedCanonicalPath = $derived(canonicalPath ?? path);
  const canonical = $derived(
    resolvedCanonicalPath ? absoluteUrl(resolvedCanonicalPath, siteUrl) : absoluteUrl('', siteUrl)
  );
  const socialTitle = $derived(ogTitle ?? title);
  const jsonLdBlocks = $derived(
    jsonLd === undefined ? [] : Array.isArray(jsonLd) ? jsonLd : [jsonLd]
  );
</script>

<svelte:head>
  <title>{fullTitle}</title>

  {#if description}
    <meta name="description" content={description} />
  {/if}

  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {:else if resolvedCanonicalPath}
    <link rel="canonical" href={canonical} />
  {/if}

  {#if description && !noindex}
    <meta property="og:type" content={ogType} />
    <meta property="og:title" content={socialTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:site_name" content={APP_NAME} />
    <meta property="og:locale" content="en_US" />
    {#if articlePublishedTime}
      <meta property="article:published_time" content={articlePublishedTime} />
    {/if}
    {#if articleModifiedTime}
      <meta property="article:modified_time" content={articleModifiedTime} />
    {/if}
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={socialTitle} />
    <meta name="twitter:description" content={description} />
  {/if}

  {#each jsonLdBlocks as block, index (index)}
    {@html `<script type="application/ld+json">${jsonLdScript(block)}</script>`}
  {/each}
</svelte:head>
