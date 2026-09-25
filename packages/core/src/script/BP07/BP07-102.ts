// BP07-102 Meowskers Ambush! — Havencraft amulet, 1. 自然・光輝・獣.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a {[havencraft]} follower from
// among them and add it to your hand. Put the rest on the bottom of your deck in any order.
// {[act]} {[cost01]}, {[engage]}, bury this card: You may summon a follower with "Meowskers" in its
// name from your hand. (It can be activated without one — ruling.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, isClass, isFollower, nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: and(isFollower, isClass("Havencraft")), to: "hand" });
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          const options = fx.game.cards(fx.controller, "hand").filter((id) => and(isFollower, nameIncludes("Meowskers"))(fx.game, id));
          const [pick] = yield* fx.chooseCards(options, 0, 1);
          if (pick !== undefined) yield* fx.putOntoField([pick]);
        },
      },
    ),
  ],
});
