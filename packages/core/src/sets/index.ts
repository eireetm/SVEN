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
import { BP11_CARDS, BP11_SCRIPTS } from "./bp11";
import { BP12_CARDS, BP12_SCRIPTS } from "./bp12";
import { BP13_CARDS, BP13_SCRIPTS } from "./bp13";
import { BP14_CARDS, BP14_SCRIPTS } from "./bp14";
import { BP15_CARDS, BP15_SCRIPTS } from "./bp15";
import { BP16_CARDS, BP16_SCRIPTS } from "./bp16";
import { BP17_CARDS, BP17_SCRIPTS } from "./bp17";
import { BP18_CARDS, BP18_SCRIPTS } from "./bp18";
import { BP19_CARDS, BP19_SCRIPTS } from "./bp19";
import { BP20_CARDS, BP20_SCRIPTS } from "./bp20";
import { BP21_CARDS, BP21_SCRIPTS } from "./bp21";
import { CP01_CARDS, CP01_SCRIPTS } from "./cp01";
import { CP02_CARDS, CP02_SCRIPTS } from "./cp02";
import { CP03_CARDS, CP03_SCRIPTS } from "./cp03";
import { CP04_CARDS, CP04_SCRIPTS } from "./cp04";
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
  BP11: { cards: BP11_CARDS, scripts: BP11_SCRIPTS },
  BP12: { cards: BP12_CARDS, scripts: BP12_SCRIPTS },
  BP13: { cards: BP13_CARDS, scripts: BP13_SCRIPTS },
  BP14: { cards: BP14_CARDS, scripts: BP14_SCRIPTS },
  BP15: { cards: BP15_CARDS, scripts: BP15_SCRIPTS },
  BP16: { cards: BP16_CARDS, scripts: BP16_SCRIPTS },
  BP17: { cards: BP17_CARDS, scripts: BP17_SCRIPTS },
  BP18: { cards: BP18_CARDS, scripts: BP18_SCRIPTS },
  BP19: { cards: BP19_CARDS, scripts: BP19_SCRIPTS },
  BP20: { cards: BP20_CARDS, scripts: BP20_SCRIPTS },
  BP21: { cards: BP21_CARDS, scripts: BP21_SCRIPTS },
  CP01: { cards: CP01_CARDS, scripts: CP01_SCRIPTS },
  CP02: { cards: CP02_CARDS, scripts: CP02_SCRIPTS },
  CP03: { cards: CP03_CARDS, scripts: CP03_SCRIPTS },
  CP04: { cards: CP04_CARDS, scripts: CP04_SCRIPTS },
};

export const ALL_CARDS: readonly CardDefinition[] = Object.values(SETS).flatMap((s) => s.cards);

export const ALL_SCRIPTS: ScriptRegistry = Object.assign({}, ...Object.values(SETS).map((s) => s.scripts));
