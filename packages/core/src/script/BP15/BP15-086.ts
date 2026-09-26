// BP15-086 Loathing Desire — Abysscraft spell, 1. 絶傑・魔界.
// Deal 1 damage to your leader. Look at the top 4 cards of your deck. You may reveal a card with both the Omen and
// Demon traits from among them and add it to your hand. Put the rest on the bottom of your deck in any order. If you
// revealed a follower with "Valnareik" in its name, give your leader {[defense]}+2. (The card added to the hand;
// the defense is checked afterwards, so 1 defense survives it — rulings.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { omenDemon, valnareikFollower } from "./shared-abyss";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        const added = yield* lookAtTopCards(fx, 4, { filter: omenDemon, to: "hand" });
        if (added.some((id) => valnareikFollower(fx.game, id))) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
