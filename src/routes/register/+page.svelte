<script lang="ts">
  import { goto } from '$app/navigation';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import { register } from '$lib/stores/auth';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let error = $state('');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = '';

    if (!name.trim()) {
      error = 'Enter an account name.';
      return;
    }

    const created = register(email, name);
    if (!created) {
      error = 'An account with this email already exists.';
      return;
    }

    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Register · MemLyra</title>
</svelte:head>

<AuthCard
  title="Create account"
  description="Start building your flashcard library."
  submitLabel="Create account"
  alternateText="Already have an account? "
  alternateHref="/login"
  alternateLabel="Log in"
  onsubmit={handleSubmit}
>
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
    />
  </label>
</AuthCard>
