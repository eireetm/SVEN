// BP10-040 Imperator of Magic — Runecraft follower, 5, 1/1. アルカナ・魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Search your deck for a Golem follower that costs 6 or less, summon it, then shuffle.
// (元のコスト.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

const golem = and(isFollower, hasTrait("ゴーレム"), costAtMost(6));

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => golem(fx.game, id), { to: "field" });
      },
    }),
  ],
});
