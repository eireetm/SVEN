// Shared pieces of BP13 Neutral card scripts (not a card: the file name has no set prefix).
import type { AutomaticAbility } from "../types";
import { whenYourFollowerLeaves } from "../helpers";

/**
 * BP13-108 / 109 "During your turn, whenever a follower is put from your field into the cemetery, deal 1
 * damage to each enemy leader." Once per follower, tokens and followers put there as a cost too, and this
 * card itself (look-back, CR 10.7.4.2); not a Ghost banished by its own ability (rulings).
 */
export const miriamBurn: AutomaticAbility = whenYourFollowerLeaves(
  {
    *resolve(fx) {
      yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
    },
  },
  { to: "cemetery", onlyYourTurn: true, includeSelf: true },
);
