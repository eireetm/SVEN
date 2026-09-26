// BP15-121 Messenger of the Skies — Neutral follower, 5, 3/4. 天使.
// {[fanfare]} Select an enemy follower on the field. Destroy it and look at the top 4 cards of your deck. You may
// reveal an Angel or Fallen Angel card from among them and add it to your hand. Put the rest on the bottom of your
// deck in any order. (Not without a target — ruling.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower } from "../targets";
import { angel, fallenAngel } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => angel(g, id) || fallenAngel(g, id), to: "hand" });
      },
    }),
  ],
});
