// CP03-025 High Dog Breeder, Akane — Swordcraft follower, 5, 3/3. ヴァンガード・ロイヤルパラディン.
// {[evolve]} {[cost02]}: Evolve this follower into a Soul Saver Dragon.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may summon up to 2 Royal Paladin followers that cost 2
// or less and give them Rush. Put the rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, royalPaladin } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2, { into: ["Soul Saver Dragon"] }),
    fanfare({
      *resolve(fx) {
        const summoned = yield* lookAtTopCards(fx, 5, {
          filter: (g, id) => followerThat(royalPaladin)(g, id) && costAtMost(2)(g, id),
          to: "field",
          max: 2,
        });
        for (const id of summoned) yield* fx.giveKeyword(id, "rush");
      },
    }),
  ],
});
