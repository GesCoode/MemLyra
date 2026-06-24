<script lang="ts">
  import AuthCard from '$lib/components/AuthCard.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { SEO_DESCRIPTIONS } from '$lib/utils/seo';

  let email = $state('');
  let error = $state('');
  let success = $state('');
  let submitting = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    success = '';
    submitting = true;

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        error = data.error ?? 'Could not send reset link.';
        return;
      }

      success = data.message ?? 'If an account exists for that email, a password reset link has been sent.';
      email = '';
    } catch {
      error = 'Could not send reset link.';
    } finally {
      submitting = false;
    }
  }
</script>

<SeoHead
  title="Forgot password"
  description={SEO_DESCRIPTIONS.forgotPassword}
  path="/forgot-password"
  noindex={true}
/>

<AuthCard
  title="Forgot password"
  description="Enter your email. Verified accounts get a password reset link; unverified accounts get a new activation link."
  submitLabel={submitting ? 'Sending…' : 'Send reset link'}
  alternateText="Remembered it? "
  alternateHref="/login"
  alternateLabel="Log in"
  onsubmit={handleSubmit}
>
  {#if success}
    <p class="library-message library-message-success">{success}</p>
  {/if}

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
      disabled={submitting}
    />
  </label>
</AuthCard>
