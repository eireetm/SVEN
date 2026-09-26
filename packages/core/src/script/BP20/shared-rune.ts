// Shared pieces of BP20 Runecraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { Proc } from "../../engine/runtime/proc";
import type { TargetSpec } from "../types";
import { buryAnotherFromYourField, engageYourCards } from "../costs";
import { activated, defineCard, fanfare, lastWords } from "../helpers";
import { idolatry } from "./shared";

/** "Select another Idolatry card on your field" (BP20-037). */
export const anotherIdolatryOnYourField: TargetSpec = {
  count: 1,
  candidates: (g, c, self) => g.cards(c, "field").filter((id) => id !== self && idolatry(g, id)),
};

/** "Bury another Idolatry card on your field" as a cost (BP20-041, 044, 048, 051; CR 10.4.3). */
export const buryAnotherIdolatry = buryAnotherFromYourField(idolatry);

/** "the number of Idolatry cards on your field" (BP20-041). */
export const idolatryOnField = (g: GameReader, p: PlayerId): number => g.cards(p, "field").filter((id) => idolatry(g, id)).length;

/** "If this wasn't put onto the field from hand" (BP20-042, 046, 052, 053; from the EX area, deck or cemetery — rulings). */
export const notFromHand = (g: GameReader, self: CardId): boolean => {
  const from = g.enteredFrom(self);
  return from !== null && from !== "hand";
};

/** BP20-042 / 046 "{[fanfare]} If this wasn't put onto the field from hand, evolve this." */
export const evolveIfNotFromHand = fanfare({
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone === "field" && notFromHand(fx.game, fx.self)) yield* fx.evolve(fx.self);
  },
});

/**
 * BP20-T03 / T04 White / Black Psalm, New Revelation: "{[lastwords]} Summon a [the other one] token and [effect].
 * Activate {[engage]} 3 Idolatry cards on your field: Bury this." (It may engage itself, an Idolatry card.)
 */
export function psalm(other: string, effect: (fx: EffectContext) => Proc<void>) {
  return defineCard({
    abilities: [
      lastWords({
        *resolve(fx) {
          yield* fx.summon([other]);
          yield* effect(fx);
        },
      }),
      activated(
        { custom: engageYourCards(idolatry, 3) },
        {
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.bury([fx.self]);
          },
        },
      ),
    ],
  });
}
