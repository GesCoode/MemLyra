<script lang="ts">
  import type { User } from '$lib/stores/auth';

  let { user = null }: { user?: User | null } = $props();

  const isLoggedIn = $derived(user !== null);
</script>

<footer class="site-footer">
  <div class="site-footer__inner">
    <nav class="site-footer__nav" aria-label="Footer">
      <a class="site-footer__nav-link" href="/marketplace">Marketplace</a>
      {#if isLoggedIn}
        <a class="site-footer__nav-link" href="/dashboard/library">Library</a>
        <a class="site-footer__nav-link" href="/dashboard">Dashboard</a>
        <a class="site-footer__nav-link" href="/dashboard/account">Account</a>
      {:else}
        <a class="site-footer__nav-link" href="/try">Practice</a>
        <a class="site-footer__nav-link" href="/try/library">Try library</a>
        <a class="site-footer__nav-link" href="/login">Log in</a>
        <a class="site-footer__nav-link" href="/register">Create account</a>
      {/if}
    </nav>

    <p class="site-footer__copyright">MemLyra. All rights reserved.</p>

    <a class="site-footer__contact" href="mailto:contact@gesmoo.com">
      <span class="site-footer__contact-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="site-footer__contact-body">
        <span class="site-footer__contact-label">Contact</span>
        <span class="site-footer__contact-email">contact@gesmoo.com</span>
      </span>
    </a>
  </div>
</footer>
