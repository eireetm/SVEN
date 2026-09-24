import type { CardDefinition } from "../model/card";
import type { ScriptRegistry } from "../script/types";
import { BP01_CARDS, BP01_SCRIPTS } from "./bp01";
import { BP02_CARDS, BP02_SCRIPTS } from "./bp02";
import { BP03_CARDS, BP03_SCRIPTS } from "./bp03";
import { BP04_CARDS, BP04_SCRIPTS } from "./bp04";
import type { SupportedSet } from "./supported";

export { SUPPORTED_SETS, type SupportedSet } from "./supported";

/**
 * Card definitions and scripts of every supported set. A definition belongs to the set of its
 * canonical printing; cards of later sets reuse earlier definitions (reprinted tokens, reprints),
 * so games should use the whole pool.
 */
export const SETS: Readonly<Record<SupportedSet, { cards: readonly CardDefinition[]; scripts: ScriptRegistry }>> = {
  BP01: { cards: BP01_CARDS, scripts: BP01_SCRIPTS },
  BP02: { cards: BP02_CARDS, scripts: BP02_SCRIPTS },
  BP03: { cards: BP03_CARDS, scripts: BP03_SCRIPTS },
  BP04: { cards: BP04_CARDS, scripts: BP04_SCRIPTS },
};

export const ALL_CARDS: readonly CardDefinition[] = Object.values(SETS).flatMap((s) => s.cards);

export const ALL_SCRIPTS: ScriptRegistry = Object.assign({}, ...Object.values(SETS).map((s) => s.scripts));
