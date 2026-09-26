// Shared pieces of BP13 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { AutomaticAbility, CustomCost } from "../types";
import { atStartOfYourMainPhase } from "../helpers";

export const ALUZARD = "Aluzard, Timeworn Vampire";
export const BLOOD_ARTS = "Blood Arts";
export const DARKEST_DESIRE = "Darkest Desire";
const DORMANCY = "dormancy";

/** BP13-071 "while there are dormancy counters on it" — this card in an EX area. */
export const dormantInEx = (g: GameReader, self: CardId): boolean => g.card(self)?.zone === "ex" && g.counters(self, DORMANCY) > 0;

/**
 * BP13-071 "This card can't be played from the EX area while there are dormancy counters on it." Also
 * while it is being played: its counters go with it into the resolution zone (CR 10.6.2.1.3).
 */
export const playableUnlessDormant = (g: GameReader, self: CardId): boolean => !(g.playZone(self) === "ex" && g.counters(self, DORMANCY) > 0);

/** "remove a dormancy counter from this card in your EX area" (the cost of an automatic ability, CR 10.4.7). */
const removeDormancyCounter: CustomCost = {
  canPay: (g, _c, self) => dormantInEx(g, self),
  *pay(fx) {
    yield* fx.removeCounters(fx.self, DORMANCY, 1);
  },
};

/**
 * BP13-071 "At the start of your main phase, remove a dormancy counter from this card in your EX area: If
 * there are no dormancy counters on this card, summon it." Valid in the EX area (CR 10.3.5). Without a
 * counter the cost can't be paid, so it isn't played; the player may also choose not to pay (rulings).
 */
export const aluzardAwakens: AutomaticAbility = {
  ...atStartOfYourMainPhase({
    cost: removeDormancyCounter,
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "ex" && fx.game.counters(fx.self, DORMANCY) === 0) yield* fx.putOntoField([fx.self]);
    },
  }),
  validIn: ["ex"],
};

/**
 * BP13-071 / 072 Last Words "Put this card [and a Blood Arts token] into its owner's EX area. Place 2
 * dormancy counters on this card." This card is the base card in the cemetery (CR 4.1.4.1). With room for
 * only one of the two, the player chooses which (BP13-072 ruling; Aluzard then stays in the cemetery); a
 * full EX area takes neither (CR 4.8.3.2).
 */
export function* aluzardSleeps(fx: EffectContext, withBloodArts: boolean): Proc<void> {
  const c = fx.game.card(fx.self);
  const owner = c?.owner ?? fx.controller;
  let aluzard = c?.zone === "cemetery";
  let token = withBloodArts;
  if (aluzard && token && fx.game.exAreaLimit(owner) - fx.game.cards(owner, "ex").length === 1) {
    const [choice] = yield* fx.choose([
      { id: "aluzard", label: `Put ${ALUZARD} into the EX area` },
      { id: "token", label: `Put a ${BLOOD_ARTS} token into the EX area` },
    ]);
    aluzard = choice === "aluzard";
    token = !aluzard;
  }
  if (aluzard) {
    const [moved] = yield* fx.putIntoEx([fx.self]);
    if (moved !== undefined) yield* fx.addCounters(moved, DORMANCY, 2);
  }
  if (token) yield* fx.tokensToEx([BLOOD_ARTS], owner);
}
