// BP20-086 Castle of Entwining — Abysscraft amulet, 1. 絶傑・死霊術師・魔界.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal an {[abysscraft]} Omen card from among them and add it to
// your hand. Put the rest on the bottom of your deck in any order.
// {[act]} {[cost01]}, engage this, bury this: Choose one. (1) Select a follower on your field, and give it Rush. (2) Select a
// follower on your field and give it Assail.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { yourFollower } from "../targets";
import { abyssOmen } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: abyssOmen, to: "hand" });
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        modes: [
          {
            id: "rush",
            label: "(1) Rush to a follower of yours",
            targets: [yourFollower()],
            *resolve(fx) {
              yield* fx.giveKeyword(fx.targets[0]![0]!, "rush");
            },
          },
          {
            id: "assail",
            label: "(2) Assail to a follower of yours",
            targets: [yourFollower()],
            *resolve(fx) {
              yield* fx.giveKeyword(fx.targets[0]![0]!, "assail");
            },
          },
        ],
      },
    ),
  ],
});
