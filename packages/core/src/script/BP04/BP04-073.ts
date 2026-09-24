// BP04-073 Dragonrearer Matilda — Dragoncraft follower, 1, 1/2. 竜使い.
// {[act]} {[cost01]}, {[engage]}, put this card into its owner's cemetery: Look at the top 3 cards of
// your deck. You may reveal a Dragoncraft follower that costs 3 play points or less from among them
// and add it to your hand. Put the remaining cards on the bottom of your deck in any order.
import { activated, defineCard, lookAtTopCards } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* lookAtTopCards(fx, 3, {
            filter: (g, id) => isFollower(g, id) && isClass("Dragoncraft")(g, id) && (g.info(id).cost ?? 99) <= 3,
            to: "hand",
          });
        },
      },
    ),
  ],
});
