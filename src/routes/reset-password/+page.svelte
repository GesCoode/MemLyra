<script lang="ts">
  import { goto } from '$app/navigation';
  import { APP_NAME } from '$lib/app';
  import AuthCard from '$lib/components/AuthCard.svelte';

  let { data } = $props();

  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let submitting = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = '';

    if (password.length < 6) {
      error = 'Password must be at least 6 characters.';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match.';
      return;
    }

    submitting = true;

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token, password })
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        error = result.error ?? 'Could not reset password.';
        return;
      }

      goto('/login?reset=1', { replaceState: true });
    } catch {
      error = 'Could not reset password.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>
    {data.status === 'ready' ? `Reset password · ${APP_NAME}` : `Invalid link · ${APP_NAME}`}
  </title>
</svelte:head>

{#if data.status === 'invalid'}
  <section class="page-content flex min-h-[calc(100vh-5rem)] items-center justify-center">
    <div class="glass-panel max-w-md space-y-4 p-8 text-center sm:p-10">
      <h1 class="font-display text-3xl font-semibold text-heading">Invalid or expired link</h1>
      <p class="text-sm leading-relaxed text-muted">
        This password reset link is invalid or has expired. Request a new one to continue.
      </p>
      <a class="btn-primary inline-flex" href="/forgot-password">Request reset link</a>
    </div>
  </section>
{:else}
  <AuthCard
    title="Reset password"
    description="Choose a new password for your account."
    submitLabel={submitting ? 'Saving…' : 'Update password'}
    alternateText="Back to "
    alternateHref="/login"
    alternateLabel="log in"
    onsubmit={handleSubmit}
  >
    {#if error}
      <p class="library-message library-message-error">{error}</p>
    {/if}

    <label class="block space-y-2">
      <span class="field-label">New password</span>
      <input
        class="field-input"
        type="password"
        name="password"
        autocomplete="new-password"
        placeholder="••••••••"
        bind:value={password}
        required
        disabled={submitting}
        minlength="6"
      />
    </label>

    <label class="block space-y-2">
      <span class="field-label">Confirm new password</span>
      <input
        class="field-input"
        type="password"
        name="confirmPassword"
        autocomplete="new-password"
        placeholder="••••••••"
        bind:value={confirmPassword}
        required
        disabled={submitting}
        minlength="6"
      />
    </label>
  </AuthCard>
{/if}
