import type { CardDefinition } from "../model/card";
import type { ScriptRegistry } from "../script/types";
import { BP01_CARDS, BP01_SCRIPTS } from "./bp01";
import { BP02_CARDS, BP02_SCRIPTS } from "./bp02";
import { BP03_CARDS, BP03_SCRIPTS } from "./bp03";
import { BP04_CARDS, BP04_SCRIPTS } from "./bp04";
import { BP05_CARDS, BP05_SCRIPTS } from "./bp05";
import { BP06_CARDS, BP06_SCRIPTS } from "./bp06";
import { BP07_CARDS, BP07_SCRIPTS } from "./bp07";
import { BP08_CARDS, BP08_SCRIPTS } from "./bp08";
import { BP09_CARDS, BP09_SCRIPTS } from "./bp09";
import { BP10_CARDS, BP10_SCRIPTS } from "./bp10";
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
  BP05: { cards: BP05_CARDS, scripts: BP05_SCRIPTS },
  BP06: { cards: BP06_CARDS, scripts: BP06_SCRIPTS },
  BP07: { cards: BP07_CARDS, scripts: BP07_SCRIPTS },
  BP08: { cards: BP08_CARDS, scripts: BP08_SCRIPTS },
  BP09: { cards: BP09_CARDS, scripts: BP09_SCRIPTS },
  BP10: { cards: BP10_CARDS, scripts: BP10_SCRIPTS },
};

export const ALL_CARDS: readonly CardDefinition[] = Object.values(SETS).flatMap((s) => s.cards);

export const ALL_SCRIPTS: ScriptRegistry = Object.assign({}, ...Object.values(SETS).map((s) => s.scripts));
