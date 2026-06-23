import type { Action } from 'svelte/action';

export const portal: Action<HTMLElement, string | HTMLElement | undefined> = (
  node,
  target = 'body'
) => {
  const mountTarget =
    typeof target === 'string'
      ? (document.querySelector(target) ?? document.body)
      : (target ?? document.body);

  mountTarget.appendChild(node);

  return {
    destroy() {
      node.remove();
    }
  };
};
