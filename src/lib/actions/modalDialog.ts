const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1
  );
}

export type ModalDialogOptions = {
  onClose: () => void;
  initialFocus?: HTMLElement | null;
};

export function modalDialog(node: HTMLElement, options: ModalDialogOptions) {
  let previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      options.onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements(node);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  node.addEventListener('keydown', handleKeydown);

  queueMicrotask(() => {
    const target =
      options.initialFocus ??
      node.querySelector<HTMLElement>('[data-autofocus]') ??
      getFocusableElements(node)[0] ??
      node;
    target.focus();
  });

  return {
    update(next: ModalDialogOptions) {
      options = next;
    },
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
      previousFocus?.focus();
    }
  };
}
