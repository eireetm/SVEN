// BP15-014 Hermit of Unkilling — Forestcraft follower, 2, 2/2. 絶傑・狩人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and, if there are at least 3 Hunter cards in your cemetery,
// change its defense to 1. (If it evolves later, the difference stays — ruling, CR 5.16.2.1.)
import { changeStatsTo, defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, hunter } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "cemetery", hunter) >= 3) yield* changeStatsTo(fx, fx.targets[0]![0]!, { defense: 1 });
      },
    }),
  ],
});
