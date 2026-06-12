<script lang="ts">
  import { APP_NAME } from '$lib/app';

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.status === 'success' ? `Account activated · ${APP_NAME}` : `Invalid link · ${APP_NAME}`}</title>
</svelte:head>

<section class="page-content flex min-h-[calc(100vh-5rem)] items-center justify-center">
  <div class="glass-panel max-w-md space-y-4 p-8 text-center sm:p-10">
    {#if data.status === 'success'}
      <h1 class="font-display text-3xl font-semibold text-heading">Account activated</h1>
      <p class="text-sm leading-relaxed text-muted">
        Your email address has been verified. You can now sign in to {APP_NAME}.
      </p>
      <a class="btn-primary inline-flex" href="/login?verified=1">Go to log in</a>
    {:else}
      <h1 class="font-display text-3xl font-semibold text-heading">Invalid or expired link</h1>
      <p class="text-sm leading-relaxed text-muted">
<<<<<<< HEAD
        This activation link is invalid or has expired. Register again, use forgot password to request
        a new activation link, or contact support if you need help.
=======
        This activation link is invalid or has expired. Register again if you need a new one.
>>>>>>> 83331a6e4e67dedbe41b4a2e32f131f7c2d2ad16
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <a class="btn-secondary inline-flex" href="/register">Register</a>
        <a class="btn-primary inline-flex" href="/forgot-password">Request new link</a>
      </div>
    {/if}
  </div>
</section>
