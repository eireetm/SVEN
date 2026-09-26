// BP08-077 Chris Pumpkinhead (Evolved) — Abysscraft follower, 3/3. 死者.
// On Evolve — Bury the top 2 cards of your deck.
// At the start of your end phase, Necrocharge (10): select one of your followers, give it +1/+1
// and Ward, then engage it (CR 5.4, 10.7.1, 12.6.1, 13.5).
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
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
