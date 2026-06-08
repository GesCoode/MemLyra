<script lang="ts">
  let {
    title,
    message,
    actionLabel,
    actionHref,
    onAction
  }: {
    title: string;
    message: string;
    actionLabel: string;
    actionHref?: string;
    onAction?: () => void;
  } = $props();
</script>

<section class="account-verification glass-panel">
  <div class="account-verification__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
      <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
  <p class="account-verification__eyebrow">Completed</p>
  <h2 class="account-verification__title">{title}</h2>
  <p class="account-verification__message">{message}</p>
  {#if onAction}
    <button class="btn-primary" type="button" onclick={onAction}>{actionLabel}</button>
  {:else if actionHref}
    <a class="btn-primary" href={actionHref}>{actionLabel}</a>
  {/if}
</section>
