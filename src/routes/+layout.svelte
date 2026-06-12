<script lang="ts">
  import './cutepics.css';
  import favicon from '$lib/assets/favicon.svg';
  import { APP_NAME } from '$lib/app';
  import Navbar from '$lib/sections/Navbar.svelte';
  import { setUser } from '$lib/stores/auth';
  import { initTheme } from '$lib/stores/theme';

  let { children, data } = $props();

  $effect(() => {
    setUser(data.user);
  });

  if (typeof window !== 'undefined') {
    initTheme();
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>{APP_NAME}</title>
</svelte:head>

<div class="page-backdrop flex min-h-screen flex-col">
  <div class="cute-decor" aria-hidden="true">
    <div class="cute-decor__blob cute-decor__blob--1"></div>
    <div class="cute-decor__blob cute-decor__blob--2"></div>
    <div class="cute-decor__blob cute-decor__blob--3"></div>
    <span class="cute-decor__emoji cute-decor__emoji--1">🌸</span>
    <span class="cute-decor__emoji cute-decor__emoji--2">✨</span>
    <span class="cute-decor__emoji cute-decor__emoji--3">🦆</span>
    <span class="cute-decor__emoji cute-decor__emoji--4">💕</span>
  </div>

  <Navbar />

  <main class="flex-1">
    {@render children()}
  </main>
</div>
