// BP18-084 Veight, Twilit Highborn — Abysscraft follower, 2, 2/1. 吸血鬼.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Vampire card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order. If you revealed a follower with "Vania" in its name, summon a Forest
// Bat token. (The card taken — ruling.)
// {[act]} {[cost00]}: Give each Forest Bat on your field {[attack]}+1/{[defense]}+1. Activate only if there are at least 5
// Vampire cards in your cemetery, and only once per turn.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isFollower, named, nameIncludes } from "../targets";
import { FOREST_BAT, vampire } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const taken = yield* lookAtTopCards(fx, 3, { filter: vampire, to: "hand" });
        if (taken.some((id) => isFollower(fx.game, id) && nameIncludes("Vania")(fx.game, id))) yield* fx.summon([FOREST_BAT]);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: (g, c) => g.cards(c, "cemetery").filter((id) => vampire(g, id)).length >= 5,
        *resolve(fx) {
          for (const bat of fx.game.followers(fx.controller).filter((id) => named(FOREST_BAT)(fx.game, id))) yield* fx.giveStats(bat, 1, 1);
        },
      },
    ),
  ],
});
