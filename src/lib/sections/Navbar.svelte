<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import favicon from '$lib/assets/favicon.svg';
  import { signOut, type User } from '$lib/stores/auth';

  let { user = null }: { user?: User | null } = $props();

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/login', label: 'Log in' },
    { href: '/register', label: 'Register' }
  ];

  const isLoggedIn = $derived(user !== null);

  async function handleSignOut() {
    await signOut();
    await invalidateAll();
    goto('/login');
  }
</script>

<header class="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
  <div class="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
    <a href={isLoggedIn ? '/dashboard' : '/'} class="group flex min-w-0 items-center gap-2 sm:gap-3">
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/80 transition group-hover:border-border-strong sm:h-10 sm:w-10"
      >
        <img src={favicon} alt="" class="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </span>
      <span class="truncate font-display text-lg font-semibold tracking-tight text-heading sm:text-xl">MemLyra</span>
    </a>

    <nav class="flex shrink-0 flex-wrap items-center justify-end gap-0.5 sm:gap-2">
      {#if isLoggedIn}
        <a
          class="nav-link {$page.url.pathname === '/dashboard' ? 'nav-link-active' : ''}"
          href="/dashboard"
        >
          Dashboard
        </a>
        <a
          class="nav-link {$page.url.pathname.startsWith('/dashboard/account') ? 'nav-link-active' : ''}"
          href="/dashboard/account"
        >
          Account
        </a>
        <button class="nav-link nav-link-button" type="button" onclick={handleSignOut}>
          Log out
        </button>
      {:else}
        {#each publicLinks as link}
          <a
            class="nav-link {$page.url.pathname === link.href ? 'nav-link-active' : ''}"
            href={link.href}
          >
            {link.label}
          </a>
        {/each}
      {/if}
    </nav>
  </div>
</header>
