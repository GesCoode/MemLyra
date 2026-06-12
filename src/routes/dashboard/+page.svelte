<script lang="ts">
  import { user } from '$lib/stores/auth';
  import { APP_NAME } from '$lib/app';
</script>

<svelte:head>
  <title>Dashboard · {APP_NAME}</title>
</svelte:head>

<section class="page-content">
  <div class="library-header mt-0">
    <h1 class="library-header__title">
      Welcome, <span class="library-header__name">{$user?.name}</span>.
    </h1>
    <p class="library-header__desc">
      This is your protected dashboard. Add routes under <code class="library-code">src/routes/dashboard</code>
      to build out your app.
    </p>
  </div>

  <div class="mt-10 grid gap-5 sm:grid-cols-2">
    <a class="dashboard-card dashboard-card-library group" href="/dashboard/account">
      <div class="dashboard-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      <div class="dashboard-card__body">
        <span class="dashboard-card__label">Account</span>
        <h2 class="dashboard-card__title">Profile &amp; settings</h2>
        <p class="dashboard-card__desc">Update your profile, password, and theme preferences.</p>
      </div>

      <div class="dashboard-card__aside">
        <span class="dashboard-card__arrow">→</span>
      </div>
    </a>
  </div>
</section>
