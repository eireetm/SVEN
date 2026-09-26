// BP11-112 Titanic Showdown — Neutral amulet, 7. 巨人.
// This card is put onto the field engaged.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may reveal up to 5 followers that
// cost 7 or more and add them to your hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]}, bury this card: Reveal 2 random cards from your hand. Summon each follower from
// among them. (With 1 card in hand, that one; with room for one follower, the player chooses which —
// rulings.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtLeast, isFollower } from "../targets";

export default defineCard({
  entersEngaged: true,
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(isFollower, costAtLeast(7)), to: "hand", max: 5 });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          const revealed = fx.randomCards(fx.game.cards(fx.controller, "hand"), 2);
          yield* fx.reveal(revealed);
          yield* fx.putOntoField(revealed.filter((id) => isFollower(fx.game, id)));
        },
      },
    ),
  ],
});
