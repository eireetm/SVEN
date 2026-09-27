// CP04-041 Maho — Runecraft follower, 2, 2/2. プリコネ・カォン.
// {[ub]}{[fanfare]} Select your leader or another follower on your field and give it {[defense]}+1.
// {[evolve]} {[cost01]}: Evolve this.
import { defineCard, evolveAbility, fanfare, ub } from "../helpers";
import { yourLeaderOrAnotherFollower } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [yourLeaderOrAnotherFollower],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          if (target === fx.game.leader(fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 1);
          else yield* fx.giveStats(target, 0, 1);
        },
      }),
    ),
    evolveAbility(1),
  ],
});
