export function hashIndex(id: string, paletteSize: number) {
  if (!Number.isInteger(paletteSize) || paletteSize <= 0) {
    throw new RangeError(`paletteSize must be a positive integer, got ${paletteSize}`);
  }
  const hash = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % paletteSize;
}
