export function randomTagColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue} 68% 62%)`;
}

export function tagChipStyles(color: string, active = false): string {
  if (active) {
    return [
      `border-color: color-mix(in srgb, ${color} 90%, white)`,
      `background: color-mix(in srgb, ${color} 48%, var(--tag-chip-active-mix))`,
      `color: color-mix(in srgb, ${color} 8%, white)`,
      `box-shadow: 0 0 0 2px color-mix(in srgb, ${color} 34%, transparent), 0 0 20px color-mix(in srgb, ${color} 30%, transparent)`
    ].join('; ');
  }

  return [
    `border-color: color-mix(in srgb, ${color} 26%, transparent)`,
    `background: var(--tag-chip-idle-bg)`,
    `color: color-mix(in srgb, ${color} 68%, white)`
  ].join('; ');
}

export function tagDotStyle(color: string): string {
  return `background: ${color}; box-shadow: 0 0 10px color-mix(in srgb, ${color} 50%, transparent);`;
}

export function deckIndexStyle(color: string): string {
  return [
    `color: ${color}`,
    `border: 2px solid color-mix(in srgb, ${color} 72%, white)`,
    `background: color-mix(in srgb, ${color} 14%, var(--deck-index-mix))`,
    `box-shadow: inset 0 0 0 1px color-mix(in srgb, ${color} 28%, transparent), 0 0 16px color-mix(in srgb, ${color} 24%, transparent)`
  ].join('; ');
}
