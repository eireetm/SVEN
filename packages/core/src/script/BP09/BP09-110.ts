// BP09-110 Suttungr — Neutral follower, 5, 4/4. 巨人.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select up to 2 enemy followers on the field and engage them. They don't refresh during
// their controller's next start phase. (Also those already engaged — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const targets = fx.targets[0] ?? [];
        yield* fx.engage(targets);
        for (const id of targets) yield* fx.skipNextRefresh(id);
      },
    }),
  ],
});
