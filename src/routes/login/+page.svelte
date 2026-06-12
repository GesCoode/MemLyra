<script lang="ts">
  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import AccountVerification from '$lib/components/AccountVerification.svelte';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import PasswordInput from '$lib/components/PasswordInput.svelte';

  import { APP_NAME, SESSION_STORAGE_KEYS } from '$lib/app';

  const VERIFICATION_KEY = SESSION_STORAGE_KEYS.verification;

  type StoredVerification = {
    title: string;
    message: string;
    actionLabel: string;
  };

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let resendMessage = $state('');
  let resendError = $state('');
  let resending = $state(false);
  let submitting = $state(false);
  let verification = $state<StoredVerification | null>(null);

  let needsVerification = $derived(error.toLowerCase().includes('verify'));

  let notice = $derived(
    $page.url.searchParams.get('verified') === '1'
      ? 'Your account has been activated. You can sign in now.'
      : $page.url.searchParams.get('reset') === '1'
        ? 'Your password has been updated. Sign in with your new password.'
        : ''
  );

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

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    resendMessage = '';
    resendError = '';
    submitting = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        error = data.error ?? 'Could not sign in.';
        return;
      }

      await invalidateAll();
      goto('/dashboard', { replaceState: true });
    } catch {
      error = 'Could not sign in.';
    } finally {
      submitting = false;
    }
  }

  function dismissVerification() {
    verification = null;
  }

  async function resendVerificationEmail() {
    if (!email.trim()) {
      resendError = 'Enter your email address above first.';
      return;
    }

    resendMessage = '';
    resendError = '';
    resending = true;

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        resendError = data.error ?? 'Could not resend activation email.';
        return;
      }

      resendMessage = data.message ?? 'If your account still needs activation, a new link has been sent.';
    } catch {
      resendError = 'Could not resend activation email.';
    } finally {
      resending = false;
    }
  }
</script>

<svelte:head>
  <title>{verification ? `Account removed · ${APP_NAME}` : `Log in · ${APP_NAME}`}</title>
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
    description="Sign in to your account."
    submitLabel={submitting ? 'Signing in…' : 'Log in'}
    alternateText="Need an account? "
    alternateHref="/register"
    alternateLabel="Register"
    onsubmit={handleSubmit}
  >
    {#if notice}
      <p class="library-message library-message-success">{notice}</p>
    {/if}

    {#if error}
      <p class="library-message library-message-error">{error}</p>
    {/if}

    {#if needsVerification}
      <div class="space-y-2 rounded-xl border border-border bg-surface/40 p-4 text-sm">
        <p class="text-muted">
          Need a new activation link? We can send another email to the address above.
        </p>
        <button
          class="btn-secondary w-full"
          type="button"
          disabled={resending || submitting}
          onclick={resendVerificationEmail}
        >
          {resending ? 'Sending…' : 'Resend activation email'}
        </button>
        {#if resendError}
          <p class="library-message library-message-error">{resendError}</p>
        {/if}
        {#if resendMessage}
          <p class="library-message library-message-success">{resendMessage}</p>
        {/if}
      </div>
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
        disabled={submitting}
      />
    </label>

    <label class="block space-y-2">
      <span class="field-label">Password</span>
      <PasswordInput
        name="password"
        autocomplete="current-password"
        bind:value={password}
        disabled={submitting}
      />
    </label>

    <p class="text-right text-sm">
      <a class="font-semibold text-action transition hover:text-action-hover" href="/forgot-password">
        Forgot password?
      </a>
    </p>
  </AuthCard>
{/if}
