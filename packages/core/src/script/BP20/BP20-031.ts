// BP20-031 Comrade of the Swordmaster — Swordcraft follower, 4, 3/3. 兵士.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Search your deck for a 2-cost or less Officer follower, put it into your EX area, then shuffle. (元のコスト.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { officer } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && officer(g, id) && costAtMost(2)(g, id), { to: "ex" });
      },
    }),
  ],
});
