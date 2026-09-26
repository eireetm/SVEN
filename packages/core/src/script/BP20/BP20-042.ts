// BP20-042 Raio, Elimination Manifest — Runecraft follower, 9, 8/8. 絶傑・魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If this wasn't put onto the field from hand, evolve this.
// Activate Discard this and a spell with Omen and Mage traits: Put an Ersatz Elimination token into your EX area. (Valid in
// the hand — ruling; both discarded at once, CR 5.12.)
import { discardThisAnd } from "../costs";
import { activated, defineCard, evolveAbility } from "../helpers";
import { and, isSpell } from "../targets";
import { ERSATZ_ELIMINATION, omenMage } from "./shared";
import { evolveIfNotFromHand } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    evolveIfNotFromHand,
    activated(
      { custom: discardThisAnd(and(isSpell, omenMage)) },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.tokensToEx([ERSATZ_ELIMINATION]);
        },
      },
    ),
  ],
});
