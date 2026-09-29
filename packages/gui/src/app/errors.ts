// An error's text for the person: what is wrong with a deck file in the interface language; other errors (the host, the
// network) as they are.
import { DeckFormatError } from "../decks/format";
import type { Translate } from "../i18n";

export function errorText(err: unknown, t: Translate): string {
  if (err instanceof DeckFormatError) return t(err.key, err.params);
  return err instanceof Error ? err.message : String(err);
}
