<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import AccountVerification from '$lib/components/AccountVerification.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { APP_NAME, SESSION_STORAGE_KEYS } from '$lib/app';
  import {
    changePassword,
    deleteCurrentAccount,
    getAccountStartDate,
    updateProfile,
    user
  } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';

  type VerificationView = {
    title: string;
    message: string;
    actionLabel: string;
    actionHref?: string;
    useAction?: () => void;
  };

  let displayName = $state('');
  let profileMessage = $state('');
  let profileError = $state('');
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let passwordMessage = $state('');
  let passwordError = $state('');
  let confirmDelete = $state(false);
  let verification = $state<VerificationView | null>(null);

  $effect(() => {
    displayName = $user?.name ?? '';
  });

  let memberSince = $derived(
    $user
      ? getAccountStartDate($user).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : ''
  );

  function savePassword(event: SubmitEvent) {
    event.preventDefault();
    passwordMessage = '';
    passwordError = '';

    if (newPassword.length < 6) {
      passwordError = 'New password must be at least 6 characters.';
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordError = 'New passwords do not match.';
      return;
    }

    void (async () => {
      const result = await changePassword(currentPassword, newPassword);
      if (!result.ok) {
        passwordError = result.error;
        return;
      }

      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
      passwordMessage = 'Password updated.';
    })();
  }

  function saveProfile(event: SubmitEvent) {
    event.preventDefault();
    profileMessage = '';
    profileError = '';

    void (async () => {
      const updated = await updateProfile(displayName);
      if (!updated) {
        profileError = 'Enter a display name to save your profile.';
        return;
      }

      profileMessage = 'Profile updated.';
    })();
  }

  function handleDeleteAccount() {
    void (async () => {
      const removed = await deleteCurrentAccount();
      if (!removed) return;

      if (browser) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEYS.verification,
          JSON.stringify({
            title: 'Account removed',
            message: 'Your account has been permanently deleted.',
            actionLabel: 'Continue to log in'
          })
        );
      }

      goto('/login');
    })();

    confirmDelete = false;
  }
</script>

<svelte:head>
  <title>Account · {APP_NAME}</title>
</svelte:head>

<section class="page-content account-page">
  {#if verification}
    <AccountVerification
      title={verification.title}
      message={verification.message}
      actionLabel={verification.actionLabel}
      actionHref={verification.actionHref}
      onAction={verification.useAction}
    />
  {:else}
    <div class="library-header mt-0">
      <h1 class="library-header__title">Account</h1>
      <p class="library-header__desc">Manage your profile and account settings.</p>
    </div>

    <div class="account-page__sections">
      <section class="account-panel glass-panel">
        <h2 class="account-panel__title">Profile</h2>
        <form class="account-profile-form" onsubmit={saveProfile}>
          <label class="account-field">
            <span class="field-label">Display name</span>
            <input class="field-input" bind:value={displayName} autocomplete="name" required />
          </label>

          <label class="account-field">
            <span class="field-label">Email</span>
            <input class="field-input" value={$user?.email ?? ''} readonly disabled />
          </label>

          <p class="account-meta">Member since {memberSince}</p>

          {#if profileError}
            <p class="library-message library-message-error">{profileError}</p>
          {/if}
          {#if profileMessage}
            <p class="library-message library-message-success">{profileMessage}</p>
          {/if}

          <button class="btn-secondary account-panel__action" type="submit">Save profile</button>
        </form>
      </section>

      <section class="account-panel glass-panel">
        <h2 class="account-panel__title">Password</h2>
        <p class="account-panel__desc">Update the password you use to sign in.</p>

        <form class="account-profile-form" onsubmit={savePassword}>
          <label class="account-field">
            <span class="field-label">Current password</span>
            <input
              class="field-input"
              type="password"
              bind:value={currentPassword}
              autocomplete="current-password"
              required
            />
          </label>

          <label class="account-field">
            <span class="field-label">New password</span>
            <input
              class="field-input"
              type="password"
              bind:value={newPassword}
              autocomplete="new-password"
              required
              minlength="6"
            />
          </label>

          <label class="account-field">
            <span class="field-label">Confirm new password</span>
            <input
              class="field-input"
              type="password"
              bind:value={confirmPassword}
              autocomplete="new-password"
              required
              minlength="6"
            />
          </label>

          {#if passwordError}
            <p class="library-message library-message-error">{passwordError}</p>
          {/if}
          {#if passwordMessage}
            <p class="library-message library-message-success">{passwordMessage}</p>
          {/if}

          <button class="btn-secondary account-panel__action" type="submit">Update password</button>
        </form>
      </section>

      <section class="account-panel glass-panel">
        <h2 class="account-panel__title">Appearance</h2>
        <p class="account-panel__desc">Choose how {APP_NAME} looks for your account.</p>

        <div class="account-appearance-row">
          <div>
            <h3 class="account-appearance-row__title">Theme</h3>
            <p class="account-appearance-row__desc">
              {$theme === 'dark' ? 'Dark mode is on.' : 'Light mode is on.'}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section class="account-panel glass-panel account-panel-danger">
        <h2 class="account-panel__title">Danger zone</h2>
        <p class="account-panel__desc">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>

        <div class="account-danger-list">
          <article class="account-danger-item">
            <div>
              <h3 class="account-danger-item__title">Delete account</h3>
              <p class="account-danger-item__desc">
                Removes your account, sessions, and profile from the database.
              </p>
            </div>
            <button class="btn-danger shrink-0" type="button" onclick={() => (confirmDelete = true)}>
              Delete account
            </button>
          </article>
        </div>
      </section>
    </div>
  {/if}
</section>

<ConfirmDialog
  open={confirmDelete}
  title="Delete account?"
  message={`This permanently deletes your account and all associated data. You will need to register again to use ${APP_NAME}.`}
  confirmLabel="Delete account"
  cancelLabel="Cancel"
  onConfirm={handleDeleteAccount}
  onCancel={() => (confirmDelete = false)}
/>
