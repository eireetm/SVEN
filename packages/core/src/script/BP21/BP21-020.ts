// BP21-020 Galdr, Heroic Headmaster — Swordcraft follower, 4, 3/3. 指揮官・学院・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost02]} Search your deck for an Academic follower that costs 2 or less, summon it, then shuffle. (CR 10.4.7.4;
// 元のコスト.)
import { playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost } from "../targets";
import { academicFollower } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => academicFollower(fx.game, id) && costAtMost(2)(fx.game, id), { to: "field" });
      },
    }),
  ],
});
