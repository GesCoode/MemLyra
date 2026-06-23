export type FixedMenuPosition = {
  top: number;
  left: number;
};

export function getFixedMenuPosition(
  anchor: HTMLElement,
  menu: HTMLElement | null,
  gap = 6
): FixedMenuPosition {
  const rect = anchor.getBoundingClientRect();
  const menuHeight = menu?.offsetHeight ?? 140;
  const menuWidth = menu?.offsetWidth ?? 160;
  const opensUp = window.innerHeight - rect.bottom < menuHeight + gap;

  let left = rect.left;
  if (left + menuWidth > window.innerWidth - 8) {
    left = rect.right - menuWidth;
  }
  left = Math.max(8, left);

  const top = opensUp
    ? Math.max(8, rect.top - menuHeight - gap)
    : rect.bottom + gap;

  return { top, left };
}
