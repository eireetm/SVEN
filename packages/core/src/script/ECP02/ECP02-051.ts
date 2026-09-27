// ECP02-051 Nono Morikubo [individuals] (Evolved) — 2/2.
// On Evolve - Look at the top 4 cards of your deck. You may summon an iM@S CG follower that costs 2 or less from among them. Put the
// rest on the bottom of your deck in any order. (元のコスト.)
// Whenever a follower with "Mirei Hayasaka" or "Syoko Hoshi" in its name is put onto your field, give it {[attack]}+1/{[defense]}+1.
// (On the opponent's turn too — ruling.)
import { defineCard, lookAtTopCards, onEvolve, whenFollowerEntersYourField } from "../helpers";
import { costAtMost } from "../targets";
import { followerNamed, followerThat, imas } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => followerThat(imas)(g, id) && costAtMost(2)(g, id), to: "field" });
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 1, 1);
        },
      },
      { filter: followerNamed("Mirei Hayasaka", "Syoko Hoshi") },
    ),
  ],
});
