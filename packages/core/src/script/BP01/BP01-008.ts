// BP01-008 Homecoming — Forestcraft spell, 3.
// Select an enemy follower on the field. Its controller puts it on the top or bottom of its
// owner's deck. Combo (5): Each opponent puts each follower from their field on the top or
// bottom of its owner's deck instead. (The controllers determine the placement. Tokens put into
// a player's deck are removed from the game.)
// Rulings: a target is required even with Combo (5); the opponent decides order and how many
// go on top / bottom.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        const cards = fx.game.combo(fx.controller, 5) ? fx.game.followers(opp) : fx.targets[0]!;
        const top = yield* fx.chooseCards(cards, 0, cards.length, opp);
        yield* fx.putOnDeckInAnyOrder(top, "top", opp);
        yield* fx.putOnDeckInAnyOrder(cards.filter((c) => !top.includes(c)), "bottom", opp);
      },
    }),
  ],
});
