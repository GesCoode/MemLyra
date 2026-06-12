<script lang="ts">
  import { PASSWORD_REQUIREMENTS_HINT } from '$lib/utils/passwordPolicy';

  let {
    value = $bindable(''),
    name,
    id,
    autocomplete = 'current-password',
    placeholder = '••••••••',
    required = true,
    disabled = false,
    showHint = false
  }: {
    value?: string;
    name?: string;
    id?: string;
    autocomplete?: AutoFill;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    showHint?: boolean;
  } = $props();

  let visible = $state(false);
</script>

<div class="password-field">
  <div class="password-field__control">
    <input
      class="field-input password-field__input"
      type={visible ? 'text' : 'password'}
      {name}
      {id}
      {autocomplete}
      {placeholder}
      {required}
      {disabled}
      bind:value
    />
    <button
      class="password-field__toggle"
      type="button"
      tabindex="-1"
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      {disabled}
      onclick={() => (visible = !visible)}
    >
      {#if visible}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path
            d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 7.5a11.2 11.2 0 0 1-1.67 2.94M6.1 6.1A11.18 11.18 0 0 0 1 11.5C2.73 15.89 7 19 12 19c1.05 0 2.06-.16 3-.45"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      {/if}
    </button>
  </div>

  {#if showHint}
    <p class="password-field__hint">{PASSWORD_REQUIREMENTS_HINT}</p>
  {/if}
</div>
