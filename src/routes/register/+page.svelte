<script lang="ts">
  import { APP_NAME } from '$lib/app';
  import AuthCard from '$lib/components/AuthCard.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let success = $state('');
  let emailSent = $state(true);
  let submitting = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    success = '';
    submitting = true;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        email?: string;
        emailSent?: boolean;
      };

      if (!response.ok) {
        error = data.error ?? 'Could not create account.';
        return;
      }

      emailSent = data.emailSent !== false;
      success = data.message ?? 'Check your email to activate your account.';
      email = '';
      name = '';
      password = '';
    } catch {
      error = 'Could not create account.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Register · {APP_NAME}</title>
</svelte:head>

<AuthCard
  title="Create account"
  description="Create an account to get started."
  submitLabel={submitting ? 'Creating account…' : 'Create account'}
  alternateText="Already have an account? "
  alternateHref="/login"
  alternateLabel="Log in"
  onsubmit={handleSubmit}
>
  {#if success}
    <p class="library-message library-message-success">{success}</p>
    {#if emailSent}
      <p class="text-sm leading-relaxed text-muted">
        Open the activation link in your email before signing in. Check spam if it does not arrive
        within a few minutes.
      </p>
    {:else}
      <p class="text-sm leading-relaxed text-muted">
        Go to the log in page and use “Resend activation email”, or contact support if you need help.
      </p>
    {/if}
  {/if}

  {#if error}
    <p class="library-message library-message-error">{error}</p>
  {/if}

  <label class="block space-y-2">
    <span class="field-label">Account name</span>
    <input
      class="field-input"
      type="text"
      name="name"
      autocomplete="nickname"
      placeholder="How should we greet you?"
      bind:value={name}
      required
      disabled={submitting}
    />
  </label>

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
    <input
      class="field-input"
      type="password"
      name="password"
      autocomplete="new-password"
      placeholder="At least 6 characters"
      minlength="6"
      bind:value={password}
      required
      disabled={submitting}
    />
  </label>
</AuthCard>
