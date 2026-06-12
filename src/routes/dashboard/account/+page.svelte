<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import AccountVerification from '$lib/components/AccountVerification.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import {
    changePassword,
    deleteCurrentAccount,
    getAccountStartDate,
    updateProfile,
    user
  } from '$lib/stores/auth';
  import { flashcards } from '$lib/stores/flashcards';
  import { removeLibrary, removeProgressMetrics } from '$lib/utils/accountActions';
  import { theme } from '$lib/stores/theme';

  type ConfirmAction = 'progress' | 'library' | 'account';

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
  let confirmAction = $state<ConfirmAction | null>(null);
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

  function openConfirm(action: ConfirmAction) {
    confirmAction = action;
  }

  function closeConfirm() {
    confirmAction = null;
  }

  function handleConfirm() {
    if (!confirmAction) return;

    if (confirmAction === 'progress') {
      void (async () => {
        await removeProgressMetrics();
        verification = {
          title: 'Progress metrics removed',
          message:
            'All exercise stats, stars, and learned dates have been cleared from your flashcards. Your library content is unchanged.',
          actionLabel: 'Back to account',
          useAction: () => (verification = null)
        };
      })();
    } else if (confirmAction === 'library') {
      void (async () => {
        await removeLibrary();
        verification = {
          title: 'Library removed',
          message:
            'All flashcards, decks, and tags have been deleted from this account. Your account is still active.',
          actionLabel: 'Back to account',
          useAction: () => (verification = null)
        };
      })();
    } else if (confirmAction === 'account') {
      void (async () => {
        await removeLibrary();
        const removed = await deleteCurrentAccount();
        if (!removed) return;

        if (browser) {
          sessionStorage.setItem(
            'memlyra-verification',
            JSON.stringify({
              title: 'Account removed',
              message:
                'Your account and all saved learning data on this account have been permanently deleted.',
              actionLabel: 'Continue to log in'
            })
          );
        }

        goto('/login');
      })();

      confirmAction = null;
      return;
    }

    confirmAction = null;
  }

  let confirmCopy = $derived(
    confirmAction === 'progress'
      ? {
          title: 'Remove progress metrics?',
          message:
            'This clears stars, learned dates, and exercise stats on every flashcard. Your flashcards, decks, and tags stay in your library.',
          confirmLabel: 'Remove progress'
        }
      : confirmAction === 'library'
        ? {
            title: 'Remove library?',
            message:
              'This permanently deletes all flashcards, decks, and tags on this account. Progress metrics go with them. This cannot be undone.',
            confirmLabel: 'Remove library'
          }
        : confirmAction === 'account'
          ? {
              title: 'Remove account?',
              message:
                'This permanently deletes your account, library, and all progress on this account. You will need to register again to use MemLyra.',
              confirmLabel: 'Remove account'
            }
          : null
  );
</script>

<svelte:head>
  <title>Account · MemLyra</title>
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
      <p class="library-header__desc">Manage your profile and learning data for this account.</p>
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
        <p class="account-panel__desc">Choose how MemLyra looks for your account.</p>

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
        <h2 class="account-panel__title">Data &amp; privacy</h2>
        <p class="account-panel__desc">
          These actions apply to data stored on this account. Each step asks for confirmation first.
        </p>

        <div class="account-danger-list">
          <article class="account-danger-item">
            <div>
              <h3 class="account-danger-item__title">Remove progress metrics</h3>
              <p class="account-danger-item__desc">
                Clears stars, streaks, and exercise stats while keeping your flashcards.
              </p>
              <p class="account-danger-item__meta">
                {$flashcards.length} flashcard{$flashcards.length === 1 ? '' : 's'} in library
              </p>
            </div>
            <button class="btn-danger shrink-0" type="button" onclick={() => openConfirm('progress')}>
              Remove progress
            </button>
          </article>

          <article class="account-danger-item">
            <div>
              <h3 class="account-danger-item__title">Remove library</h3>
              <p class="account-danger-item__desc">
                Deletes all flashcards, decks, tags, and their progress from this account.
              </p>
            </div>
            <button class="btn-danger shrink-0" type="button" onclick={() => openConfirm('library')}>
              Remove library
            </button>
          </article>

          <article class="account-danger-item">
            <div>
              <h3 class="account-danger-item__title">Remove account</h3>
              <p class="account-danger-item__desc">
                Permanently deletes your account and all associated data on this account.
              </p>
            </div>
            <button class="btn-danger shrink-0" type="button" onclick={() => openConfirm('account')}>
              Remove account
            </button>
          </article>
        </div>
      </section>
    </div>
  {/if}
</section>

{#if confirmCopy}
  <ConfirmDialog
    open={confirmAction !== null}
    title={confirmCopy.title}
    message={confirmCopy.message}
    confirmLabel={confirmCopy.confirmLabel}
    cancelLabel="Cancel"
    onConfirm={handleConfirm}
    onCancel={closeConfirm}
  />
{/if}
