<script lang="ts">

  import { modalDialog } from '$lib/actions/modalDialog';

  import { decks, isDeckNameTaken } from '$lib/stores/decks';

  import { importMarketplaceDeck } from '$lib/stores/marketplace';



  let {

    open = false,

    deckId = null,

    defaultTitle = '',

    cardCount = 0,

    onClose,

    onImported

  }: {

    open?: boolean;

    deckId?: string | null;

    defaultTitle?: string;

    cardCount?: number;

    onClose: () => void;

    onImported?: (result: { message: string; deckName: string }) => void;

  } = $props();



  let deckName = $state('');

  let importing = $state(false);

  let error = $state('');



  let trimmedName = $derived(deckName.trim());

  let nameConflict = $derived(trimmedName.length > 0 && isDeckNameTaken($decks, trimmedName));

  let canImport = $derived(trimmedName.length > 0 && !nameConflict && !importing);



  $effect(() => {

    if (open) {

      deckName = defaultTitle;

      error = '';

    }

  });



  async function handleSubmit(event: SubmitEvent) {

    event.preventDefault();

    if (!deckId || !canImport) return;



    importing = true;

    error = '';



    const result = await importMarketplaceDeck(deckId, deckName);

    importing = false;



    if (result.error || result.errors.length > 0) {

      error = result.errors[0] ?? 'Could not import deck.';

      return;

    }



    onImported?.({

      message: `Imported ${result.imported} card${result.imported === 1 ? '' : 's'} into “${result.deckName ?? trimmedName}”.`,

      deckName: result.deckName ?? trimmedName

    });

    onClose();

  }

</script>



{#if open && deckId}

  <button class="confirm-dialog__backdrop" type="button" aria-label="Close dialog" onclick={onClose}></button>



  <div

    class="confirm-dialog marketplace-import-dialog"

    role="dialog"

    aria-modal="true"

    aria-labelledby="marketplace-import-title"

    use:modalDialog={{ onClose }}

  >

    <h3 id="marketplace-import-title" class="confirm-dialog__title">Import deck</h3>

    <p class="confirm-dialog__message">

      Add this deck to your library. You can rename it before importing.

    </p>



    <form class="publish-deck-dialog__form" onsubmit={handleSubmit}>

      <label class="library-field">

        <span class="field-label">Name in your library</span>

        <input

          class="field-input"

          class:field-input--invalid={nameConflict}

          bind:value={deckName}

          required

          maxlength="120"

          aria-invalid={nameConflict}

          aria-describedby={nameConflict ? 'marketplace-import-name-error' : undefined}

        />

      </label>



      {#if nameConflict}

        <p id="marketplace-import-name-error" class="library-message library-message-error">

          You already have a deck with this name. Choose a different name to import.

        </p>

      {/if}



      {#if error}

        <p class="library-message library-message-error">{error}</p>

      {/if}



      <div class="confirm-dialog__actions">

        <button class="btn-secondary" type="button" onclick={onClose}>Cancel</button>

        <button class="btn-marketplace" type="submit" disabled={!canImport}>

          {importing ? 'Importing…' : `Import ${cardCount} card${cardCount === 1 ? '' : 's'}`}

        </button>

      </div>

    </form>

  </div>

{/if}

