// Checking a deck file in a format: the engine's check (Engine.validateDeck in the worker, CR 6.1) and the format's own
// (formats.ts).
import type { Catalog } from "../app/catalog";
import { useSettings } from "../app/settings";
import { engine } from "../app/store";
import { toDeckList, type DeckFile } from "../decks/format";
import type { FormatId } from "../engine/protocol";
import { formatProblems, leadersFor, type FormatProblem } from "./formats";
import { restrictionList, type RestrictionList } from "./lists";

export async function checkDeck(deck: DeckFile, format: FormatId, list: RestrictionList | null, catalog: Catalog): Promise<FormatProblem[]> {
  const { leader } = leadersFor(deck, format, catalog);
  const problems = await engine.validateDeck(toDeckList(deck, leader), format !== "unlimited");
  return formatProblems(deck, format, list, catalog, problems);
}

/** The format chosen in the settings, and its restriction list (none in unlimited). */
export function useFormat(): { format: FormatId; list: RestrictionList | null } {
  const { format, restrictionLists } = useSettings();
  return { format, list: format === "unlimited" ? null : restrictionList(restrictionLists[format]) };
}
