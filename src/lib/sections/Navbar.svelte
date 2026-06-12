<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import { APP_NAME } from '$lib/app';
</script>

<header class="site-header">
  <div class="page-content !py-4 !pb-4 !pt-4 sm:!px-6">
    <a href="/" class="site-header__brand group">
      <span class="site-header__logo group-hover:scale-105">
        <img src={favicon} alt="" aria-hidden="true" />
      </span>
      <span class="site-header__name">{APP_NAME}</span>
    </a>
  </div>
</header>
