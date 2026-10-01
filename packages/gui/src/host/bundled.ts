// Resources built into the Android app (a release with the player's resources: vite.config.ts SVE_BUNDLE_PUBLIC).
// The player's own files in the phone's public/ folder go first.

/** A resource's path without its file type: "images/cards/BP01-001.png" -> "images/cards/BP01-001". */
const withoutType = (path: string): string => path.replace(/\.[^./]+$/, "");

/**
 * The resources the app uses: the player's own files, and the built-in ones they don't replace. A file replaces a built-in
 * one of the same path whatever its type (their BP01-001.png replaces the app's BP01-001.webp), as the lookup would
 * otherwise pick between the two by type (resources/lookup.ts).
 */
export function mergeResources(own: readonly string[], bundled: readonly string[]): string[] {
  const replaced = new Set(own.map(withoutType));
  return [...own, ...bundled.filter((path) => !replaced.has(withoutType(path)))].sort();
}
