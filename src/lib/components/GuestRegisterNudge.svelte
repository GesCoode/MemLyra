<script lang="ts">
  let {
    variant = 'banner',
    class: className = ''
  }: {
    variant?: 'banner' | 'card' | 'inline';
    class?: string;
  } = $props();
</script>

{#if variant === 'banner'}
  <aside class="guest-nudge guest-nudge--banner {className}" role="note">
    <p class="guest-nudge__text">
      Guest mode — your flashcards and progress are saved on this device only.
      <a class="guest-nudge__link" href="/register">Create a free account</a>
      to sync your library and unlock progress tracking.
    </p>
  </aside>
{:else if variant === 'card'}
  <aside class="guest-nudge guest-nudge--card {className}" role="note">
    <div class="guest-nudge__card-body">
      <p class="guest-nudge__eyebrow">Save your work</p>
      <p class="guest-nudge__title">Register to keep your flashcards and progress</p>
      <p class="guest-nudge__desc">
        Everything you add while trying MemLyra stays on this browser. Sign up and we’ll move your
        library — including hidden progress — to your account.
      </p>
      <div class="guest-nudge__actions">
        <a class="btn-primary" href="/register">Create free account</a>
        <a class="btn-secondary" href="/login">Log in</a>
      </div>
    </div>
  </aside>
{:else}
  <p class="guest-nudge guest-nudge--inline {className}" role="note">
    <a class="guest-nudge__link" href="/register">Register</a>
    to save your flashcards and see your star progress across devices.
  </p>
{/if}

<style>
  .guest-nudge--banner {
    border-bottom: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-action) 12%, var(--color-surface));
    padding: 0.65rem 1rem;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.45;
    color: var(--color-muted);
  }

  .guest-nudge--card {
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    background: var(--color-surface);
    padding: 1.25rem 1.5rem;
  }

  .guest-nudge--inline {
    font-size: 0.875rem;
    color: var(--color-muted);
    line-height: 1.5;
  }

  .guest-nudge__text {
    margin: 0;
  }

  .guest-nudge__eyebrow {
    margin: 0 0 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-action);
  }

  .guest-nudge__title {
    margin: 0 0 0.5rem;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-heading);
  }

  .guest-nudge__desc {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    line-height: 1.55;
    color: var(--color-muted);
  }

  .guest-nudge__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .guest-nudge__link {
    font-weight: 600;
    color: var(--color-action);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .guest-nudge__link:hover {
    color: var(--color-action-hover);
  }
</style>
