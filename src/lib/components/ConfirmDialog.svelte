<script lang="ts">
  let {
    open = false,
    title,
    message,
    confirmLabel = 'Remove',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel
  }: {
    open?: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();
</script>

{#if open}
  <button class="confirm-dialog__backdrop" type="button" aria-label="Close dialog" onclick={onCancel}></button>

  <div
    class="confirm-dialog"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
    aria-describedby="confirm-dialog-message"
  >
    <h3 id="confirm-dialog-title" class="confirm-dialog__title">{title}</h3>
    <p id="confirm-dialog-message" class="confirm-dialog__message">{message}</p>
    <div class="confirm-dialog__actions">
      <button class="btn-secondary" type="button" onclick={onCancel}>{cancelLabel}</button>
      <button class="btn-danger" type="button" onclick={onConfirm}>{confirmLabel}</button>
    </div>
  </div>
{/if}
