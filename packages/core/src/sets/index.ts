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
import { ECP01_CARDS, ECP01_SCRIPTS } from "./ecp01";
import { ECP02_CARDS, ECP02_SCRIPTS } from "./ecp02";
import { SD01_CARDS, SD01_SCRIPTS } from "./sd01";
import { SD02_CARDS, SD02_SCRIPTS } from "./sd02";
import { SD03_CARDS, SD03_SCRIPTS } from "./sd03";
import { SD04_CARDS, SD04_SCRIPTS } from "./sd04";
import { SD05_CARDS, SD05_SCRIPTS } from "./sd05";
import { SD06_CARDS, SD06_SCRIPTS } from "./sd06";
import { SD07_CARDS, SD07_SCRIPTS } from "./sd07";
import { SD08_CARDS, SD08_SCRIPTS } from "./sd08";
import { CSD01_CARDS, CSD01_SCRIPTS } from "./csd01";
import { CSD02a_CARDS, CSD02a_SCRIPTS } from "./csd02a";
import { CSD02b_CARDS, CSD02b_SCRIPTS } from "./csd02b";
import { CSD02c_CARDS, CSD02c_SCRIPTS } from "./csd02c";
import { CSD03a_CARDS, CSD03a_SCRIPTS } from "./csd03a";
import { CSD03b_CARDS, CSD03b_SCRIPTS } from "./csd03b";
import { DSD01a_CARDS, DSD01a_SCRIPTS } from "./dsd01a";
import { DSD01b_CARDS, DSD01b_SCRIPTS } from "./dsd01b";
import { ETD01_CARDS, ETD01_SCRIPTS } from "./etd01";
import { ETD02_CARDS, ETD02_SCRIPTS } from "./etd02";
import { ETD03_CARDS, ETD03_SCRIPTS } from "./etd03";
import { EBD01_CARDS, EBD01_SCRIPTS } from "./ebd01";
import { EBD02_CARDS, EBD02_SCRIPTS } from "./ebd02";
import { EBD03_CARDS, EBD03_SCRIPTS } from "./ebd03";
import { EBD04_CARDS, EBD04_SCRIPTS } from "./ebd04";
import { SP01_CARDS, SP01_SCRIPTS } from "./sp01";
import { PCS01_CARDS, PCS01_SCRIPTS } from "./pcs01";
import { PCS02_CARDS, PCS02_SCRIPTS } from "./pcs02";
import { LCS01_CARDS, LCS01_SCRIPTS } from "./lcs01";
import { SCS01_CARDS, SCS01_SCRIPTS } from "./scs01";
import { PR_CARDS, PR_SCRIPTS } from "./pr";
import { BP22_CARDS, BP22_SCRIPTS } from "./bp22";
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
  ECP01: { cards: ECP01_CARDS, scripts: ECP01_SCRIPTS },
  ECP02: { cards: ECP02_CARDS, scripts: ECP02_SCRIPTS },
  SD01: { cards: SD01_CARDS, scripts: SD01_SCRIPTS },
  SD02: { cards: SD02_CARDS, scripts: SD02_SCRIPTS },
  SD03: { cards: SD03_CARDS, scripts: SD03_SCRIPTS },
  SD04: { cards: SD04_CARDS, scripts: SD04_SCRIPTS },
  SD05: { cards: SD05_CARDS, scripts: SD05_SCRIPTS },
  SD06: { cards: SD06_CARDS, scripts: SD06_SCRIPTS },
  SD07: { cards: SD07_CARDS, scripts: SD07_SCRIPTS },
  SD08: { cards: SD08_CARDS, scripts: SD08_SCRIPTS },
  CSD01: { cards: CSD01_CARDS, scripts: CSD01_SCRIPTS },
  CSD02a: { cards: CSD02a_CARDS, scripts: CSD02a_SCRIPTS },
  CSD02b: { cards: CSD02b_CARDS, scripts: CSD02b_SCRIPTS },
  CSD02c: { cards: CSD02c_CARDS, scripts: CSD02c_SCRIPTS },
  CSD03a: { cards: CSD03a_CARDS, scripts: CSD03a_SCRIPTS },
  CSD03b: { cards: CSD03b_CARDS, scripts: CSD03b_SCRIPTS },
  DSD01a: { cards: DSD01a_CARDS, scripts: DSD01a_SCRIPTS },
  DSD01b: { cards: DSD01b_CARDS, scripts: DSD01b_SCRIPTS },
  ETD01: { cards: ETD01_CARDS, scripts: ETD01_SCRIPTS },
  ETD02: { cards: ETD02_CARDS, scripts: ETD02_SCRIPTS },
  ETD03: { cards: ETD03_CARDS, scripts: ETD03_SCRIPTS },
  EBD01: { cards: EBD01_CARDS, scripts: EBD01_SCRIPTS },
  EBD02: { cards: EBD02_CARDS, scripts: EBD02_SCRIPTS },
  EBD03: { cards: EBD03_CARDS, scripts: EBD03_SCRIPTS },
  EBD04: { cards: EBD04_CARDS, scripts: EBD04_SCRIPTS },
  SP01: { cards: SP01_CARDS, scripts: SP01_SCRIPTS },
  PCS01: { cards: PCS01_CARDS, scripts: PCS01_SCRIPTS },
  PCS02: { cards: PCS02_CARDS, scripts: PCS02_SCRIPTS },
  LCS01: { cards: LCS01_CARDS, scripts: LCS01_SCRIPTS },
  SCS01: { cards: SCS01_CARDS, scripts: SCS01_SCRIPTS },
  PR: { cards: PR_CARDS, scripts: PR_SCRIPTS },
  BP22: { cards: BP22_CARDS, scripts: BP22_SCRIPTS },
};

export const ALL_CARDS: readonly CardDefinition[] = Object.values(SETS).flatMap((s) => s.cards);

export const ALL_SCRIPTS: ScriptRegistry = Object.assign({}, ...Object.values(SETS).map((s) => s.scripts));
