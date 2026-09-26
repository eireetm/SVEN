// BP13-019 Albert, Thunderous Doom — Swordcraft follower, 6, 3/5. 指揮官・レヴィオン・キラー.
// {[evolve]} {[cost01]}: Evolve this follower.
// Storm.
// {[fanfare]} Bury another Levin follower: Select an enemy follower on the field and destroy it.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { buryAnotherFromYourField } from "../costs";
import { and, enemyFollower, isFollower } from "../targets";
import { levin } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: buryAnotherFromYourField(and(isFollower, levin)),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
