// BP10-103 Priestess of Foresight — Havencraft follower, 7, 3/6. アルカナ・信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} Search your deck for an Arcana follower that costs 4 or less, summon it, then shuffle.
// (元のコスト.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { arcana } from "./shared";

const cheapArcanaFollower = and(isFollower, arcana, costAtMost(4));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => cheapArcanaFollower(fx.game, id), { to: "field" });
      },
    }),
  ],
});
