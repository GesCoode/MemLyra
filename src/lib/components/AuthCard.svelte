<script lang="ts">
  import { APP_NAME } from '$lib/app';

  let {
    title,
    description,
    submitLabel,
    alternateText,
    alternateHref,
    alternateLabel,
    onsubmit,
    children
  }: {
    title: string;
    description: string;
    submitLabel: string;
    alternateText: string;
    alternateHref: string;
    alternateLabel: string;
    onsubmit?: (event: SubmitEvent) => void;
    children?: import('svelte').Snippet;
  } = $props();
</script>

<section class="page-content flex min-h-[calc(100vh-5rem)] items-center justify-center">
  <div class="relative w-full max-w-md">
    <div
      class="pointer-events-none absolute -inset-4 rounded-[2rem] bg-accent/10 blur-3xl"
      aria-hidden="true"
    ></div>

    <form class="glass-panel glass-panel-accent relative space-y-6 p-8 sm:p-10" {onsubmit}>
      <div class="space-y-2 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{APP_NAME}</p>
        <h1 class="font-display text-3xl font-semibold text-heading">{title}</h1>
        <p class="text-sm text-muted">{description}</p>
      </div>

      {@render children?.()}

      <button class="btn-primary w-full" type="submit">{submitLabel}</button>

      <div class="border-t border-border pt-5 text-center text-sm text-muted">
        {alternateText}
        <a class="font-semibold text-action transition hover:text-action-hover" href={alternateHref}>
          {alternateLabel}
        </a>
      </div>
    </form>
  </div>
</section>
