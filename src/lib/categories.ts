export type PictureCategory = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

export const PICTURE_CATEGORIES: PictureCategory[] = [
  {
    id: 'babies',
    label: 'Babies',
    emoji: '👶',
    description: 'Tiny humans being adorable'
  },
  {
    id: 'ducklings',
    label: 'Ducklings',
    emoji: '🦆',
    description: 'Fluffy waddlers and pond cuteness'
  },
  {
    id: 'kittens',
    label: 'Kittens',
    emoji: '🐱',
    description: 'Playful paws and whisker boops'
  },
  {
    id: 'puppies',
    label: 'Puppies',
    emoji: '🐶',
    description: 'Tail wags and floppy ears'
  },
  {
    id: 'buildings',
    label: 'Cute buildings',
    emoji: '🏠',
    description: 'Charming cottages and cozy corners'
  },
  {
    id: 'flowers',
    label: 'Flowers',
    emoji: '🌸',
    description: 'Soft petals and blooming joy'
  },
  {
    id: 'baby-animals',
    label: 'Baby animals',
    emoji: '🐰',
    description: 'Bunnies, lambs, and more fuzz'
  },
  {
    id: 'sunsets',
    label: 'Sunsets',
    emoji: '🌅',
    description: 'Golden skies and peaceful hues'
  },
  {
    id: 'miniatures',
    label: 'Miniature things',
    emoji: '🧸',
    description: 'Tiny objects that make you smile'
  },
  {
    id: 'food',
    label: 'Cute food',
    emoji: '🍰',
    description: 'Sweet treats and happy plates'
  }
];

export function getCategoryById(id: string): PictureCategory | undefined {
  return PICTURE_CATEGORIES.find((category) => category.id === id);
}
