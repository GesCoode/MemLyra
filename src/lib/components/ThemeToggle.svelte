<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<button
  class="theme-toggle"
  class:theme-toggle-light={$theme === 'light'}
  type="button"
  role="switch"
  aria-checked={$theme === 'light'}
  aria-label={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  onclick={toggleTheme}
>
  <span class="theme-toggle__track">
    <span class="theme-toggle__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
        <path
          d="M21 14.5A7.5 7.5 0 0 1 9.5 3 7.5 7.5 0 1 0 21 14.5Z"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="theme-toggle__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span class="theme-toggle__thumb" aria-hidden="true"></span>
  </span>
</button>
