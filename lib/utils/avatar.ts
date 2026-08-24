import { hashIndex } from "./hash";

// Fixed palette so each avatar without an image gets a stable, distinct circle
// color (hashed from its id) instead of every one looking the same.
const AVATAR_COLORS = ["#7c3aed", "#2563eb", "#0d9488", "#16a34a", "#ea580c", "#db2777", "#4f46e5"];

export function avatarColorFor(id: string) {
  return AVATAR_COLORS[hashIndex(id, AVATAR_COLORS.length)];
}
