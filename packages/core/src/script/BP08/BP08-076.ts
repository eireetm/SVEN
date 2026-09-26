// BP08-076 Chris Pumpkinhead — Abysscraft follower, 2, 2/2. 死者.
// {[evolve]} {[cost01]}: Evolve this follower.
// At the start of your end phase, Necrocharge (10): select one of your followers, give it +1/+1
// and Ward, then engage it (CR 5.4, 10.7.1, 13.5).
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    atStartOfYourEndPhase({
      condition: (g, c) => g.necrocharge(c, 10),
      targets: [yourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 1, 1);
        yield* fx.giveKeyword(target, "ward");
        yield* fx.engage([target]);
      },
    }),
  ],
});
