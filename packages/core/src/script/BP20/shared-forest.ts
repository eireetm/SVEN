// Shared pieces of BP20 Forestcraft card scripts (not a card: the file name has no set prefix).
import { whenFollowerEntersYourField, type TimingSpec } from "../helpers";
import { and, isToken } from "../targets";
import { pixie } from "./shared";

/** BP20-005 / 006 "Whenever you play a Fae-Touched card, give your leader {[defense]}+1." */
export const sylphLeader: TimingSpec = {
  *resolve(fx) {
    yield* fx.giveLeaderDefense(fx.controller, 1);
  },
};

/** BP20-013 / 014 "Whenever a Pixie token follower is put onto your field, give it {[attack]}+1." */
export const fairyBladeBoost = whenFollowerEntersYourField(
  {
    *resolve(fx) {
      const card = fx.data?.card;
      if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 1, 0);
    },
  },
  { filter: and(isToken, pixie) },
);
