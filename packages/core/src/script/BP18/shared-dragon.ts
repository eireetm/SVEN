// Shared pieces of BP18 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { Keyword } from "../../model/keyword";
import type { GameReader } from "../../engine/query";
import type { TimingSpec } from "../helpers";
import { atStartOfYourEndPhase, whenYourFollowerAttacks } from "../helpers";
import { bigDuelist } from "./shared";

/**
 * "Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, ..." (BP18-060, 062, 063, 066, 067):
 * its attack when it attacks; resolved before the quick window (rulings, CR 8.4.5). Data: the attacker.
 */
export const whenBigDuelistAttacks = (spec: TimingSpec) => whenYourFollowerAttacks(spec, bigDuelist);

/** BP18-062 / 063 "Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, give your leader +1." */
export const secretaryHeal = whenBigDuelistAttacks({
  *resolve(fx) {
    yield* fx.giveLeaderDefense(fx.controller, 1);
  },
});

/** BP18-066 / 067 "Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, give it {[attack]}+1." */
export const prefectPush = whenBigDuelistAttacks({
  *resolve(fx) {
    const attacker = fx.data?.card;
    if (attacker !== undefined && fx.game.card(attacker)?.zone === "field") yield* fx.giveStats(attacker, 1, 0);
  },
});

/**
 * BP18-071 / 072 "While there's another Draconic Duelist follower on your field, this has [keywords]." keywordsFor must not
 * compute card information: typeAndTraits for the others.
 */
export const loaferPassive =
  (keywords: readonly Keyword[]) =>
  (g: GameReader, self: CardId, card: CardId): readonly Keyword[] => {
    if (card !== self) return [];
    const other = g.cards(g.card(self)!.controller, "field").some((id) => {
      if (id === self) return false;
      const k = g.typeAndTraits(id);
      return k.type === "follower" && k.traits.includes("武闘竜人");
    });
    return other ? keywords : [];
  };

/** BP18-071 / 072 "At the start of your end phase, return this to its owner's hand." */
export const loaferReturn = atStartOfYourEndPhase({
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone === "field") yield* fx.returnToHand([fx.self]);
  },
});
