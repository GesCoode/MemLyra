<script lang="ts">
  import { onMount } from 'svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { APP_NAME } from '$lib/app';
  import { completePostAuth } from '$lib/utils/guestMigrateClient';
  import { SEO_DESCRIPTIONS } from '$lib/utils/seo';

  let { data } = $props();

  onMount(() => {
    if (data.status === 'success' && data.signedIn) {
      void completePostAuth('/dashboard');
    }
  });
</script>

<SeoHead
  title={data.status === 'success' ? 'Account activated' : 'Invalid link'}
  description={data.status === 'success' ? SEO_DESCRIPTIONS.verifySuccess : SEO_DESCRIPTIONS.verifyInvalid}
  path="/verify"
  noindex={true}
/>

<section class="page-content flex min-h-[calc(100vh-5rem)] items-center justify-center">
  <div class="glass-panel max-w-md space-y-4 p-8 text-center sm:p-10">
    {#if data.status === 'success'}
      <h1 class="font-display text-3xl font-semibold text-heading">Account activated</h1>
      <p class="text-sm leading-relaxed text-muted">
        {#if data.signedIn}
          Your email address has been verified. Importing your practice data and opening your dashboard…
        {:else}
          Your email address has been verified. You can now sign in to {APP_NAME}.
        {/if}
      </p>
      {#if !data.signedIn}
        <a class="btn-primary inline-flex" href="/login?verified=1">Go to log in</a>
      {/if}
    {:else}
      <h1 class="font-display text-3xl font-semibold text-heading">Invalid or expired link</h1>
      <p class="text-sm leading-relaxed text-muted">
        This activation link is invalid or has expired. Register again, use forgot password to request
        a new activation link, or contact support if you need help.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <a class="btn-secondary inline-flex" href="/register">Register</a>
        <a class="btn-primary inline-flex" href="/forgot-password">Request new link</a>
      </div>
    {/if}
  </div>
</section>
