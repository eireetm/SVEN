// BP12-070 Neun, Daybreak Vampire (Evolved) — Abysscraft follower, 4/4. 機械・吸血鬼.
// On Evolve -  Give each 1-cost follower on your field and in your EX area {[attack]}+1. (元のコスト 1;
// the cards in the EX area keep it when they are played, CR 10.6.2.1.3.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtLeast, costAtMost, isFollower } from "../targets";

const oneCostFollower = and(isFollower, costAtLeast(1), costAtMost(1));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const cards = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.controller, "ex")];
        for (const id of cards.filter((c) => oneCostFollower(fx.game, c))) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
