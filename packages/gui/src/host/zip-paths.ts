// Importing the player's resources from a zip file (the Android app): where each file of the zip goes in
// public/. Pure: tested without a phone (test/android-host.test.ts).

/** The folders of public/ a zip may fill (README "Custom resources"), and its style sheet. */
const FOLDERS = ["audio", "images", "textures", "fonts"];

const isResource = (parts: readonly string[]): boolean =>
  (parts.length === 1 && parts[0] === "theme.css") || (parts.length > 1 && FOLDERS.includes(parts[0]!));

/**
 * The public/ path of a zip entry ("images/cards/BP01-001.png"), or null when it isn't a resource. The zip may hold the
 * folders themselves, a "public" folder with them, or one folder around either ("MyPack/images/...", "MyPack/public/...").
 * Folders, hidden files and macOS's "__MACOSX" copies are not resources; nothing may climb out ("..").
 */
export function resourcePathInZip(name: string): string | null {
  if (name.endsWith("/") || name.endsWith("\\")) return null;
  let parts = name
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part !== "" && part !== ".");
  if (parts.some((part) => part === ".." || part.startsWith(".") || part === "__MACOSX")) return null;
  if (!isResource(parts) && parts[0] !== "public" && parts.length > 1) parts = parts.slice(1);
  if (parts[0] === "public") parts = parts.slice(1);
  return isResource(parts) ? parts.join("/") : null;
}
