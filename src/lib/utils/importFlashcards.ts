export type ParsedImportRow = {
  front: string;
  back: string;
  tagLabels: string[];
};

/** Parse import text: one card per line as `front,back` or `front,back,tag1;tag2`. */
export function parseImportText(text: string): ParsedImportRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const parts = line.split(',').map((part) => part.trim());
      const front = parts[0] ?? '';
      const back = parts[1] ?? '';
      const tagLabels =
        parts[2]
          ?.split(';')
          .map((tag) => tag.trim())
          .filter(Boolean) ?? [];

      return { front, back, tagLabels };
    });
}
