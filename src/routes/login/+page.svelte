<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import AccountVerification from '$lib/components/AccountVerification.svelte';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import { signIn } from '$lib/stores/auth';

  const VERIFICATION_KEY = 'memlyra-verification';

  type StoredVerification = {
    title: string;
    message: string;
    actionLabel: string;
  };

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let verification = $state<StoredVerification | null>(null);

  if (browser) {
    const stored = sessionStorage.getItem(VERIFICATION_KEY);
    if (stored) {
      try {
        verification = JSON.parse(stored) as StoredVerification;
        sessionStorage.removeItem(VERIFICATION_KEY);
      } catch {
        sessionStorage.removeItem(VERIFICATION_KEY);
      }
    }
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = '';

    const loggedIn = signIn(email);
    if (!loggedIn) {
      error = 'No account found for this email. Register first.';
      return;
    }

    goto('/dashboard');
  }

  function dismissVerification() {
    verification = null;
  }
</script>

<svelte:head>
  <title>{verification ? 'Account removed · MemLyra' : 'Log in · MemLyra'}</title>
</svelte:head>

{#if verification}
  <section class="page-content account-page">
    <AccountVerification
      title={verification.title}
      message={verification.message}
      actionLabel={verification.actionLabel}
      onAction={dismissVerification}
    />
  </section>
{:else}
  <AuthCard
    title="Welcome back"
    description="Sign in to continue learning."
    submitLabel="Log in"
    alternateText="Need an account? "
    alternateHref="/register"
    alternateLabel="Register"
    onsubmit={handleSubmit}
  >
    {#if error}
      <p class="library-message library-message-error">{error}</p>
    {/if}

    <label class="block space-y-2">
      <span class="field-label">Email</span>
      <input
        class="field-input"
        type="email"
        name="email"
        autocomplete="email"
        placeholder="you@example.com"
        bind:value={email}
        required
      />
    </label>

    <label class="block space-y-2">
      <span class="field-label">Password</span>
      <input
        class="field-input"
        type="password"
        name="password"
        autocomplete="current-password"
        placeholder="••••••••"
        bind:value={password}
        required
      />
    </label>
  </AuthCard>
{/if}
