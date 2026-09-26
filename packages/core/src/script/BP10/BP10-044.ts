// BP10-044 Juggling Moggy — Runecraft follower, 1, 1/1. アルカナ・魔法使い・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} {[cost04]}, Earth Rite: Select an enemy follower that costs 4 or less on the field and
// banish it. (Both parts are paid, or nothing happens: CR 10.4.7.4, 13.3.3.2. 元のコスト.)
import { playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: playPointsCost(4),
      earthRite: { mode: "required" },
      targets: [enemyFollower({ filter: costAtMost(4) })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
