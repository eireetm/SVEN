// ECP01-029 Neo Universe (Evolved) — 4/4.
// On Evolve - Choose one. (1) Discard an Umamusume card: Increase your max play points by 1. (2) Discard 3 Umamusume cards:
// Increase your max play points by 2. (A discarded Katsuragi Ace's ability resolves after the increase — ruling.)
// At the start of your end phase, select an enemy follower on the field and deal it 2 damage.
import { discardA, discardMatching } from "../costs";
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "one",
          label: "Discard an Umamusume card: increase your max play points by 1",
          cost: discardA(umamusume),
          *resolve(fx) {
            yield* fx.increaseMaxPlayPoints(1);
          },
        },
        {
          id: "three",
          label: "Discard 3 Umamusume cards: increase your max play points by 2",
          cost: discardMatching(umamusume, 3),
          *resolve(fx) {
            yield* fx.increaseMaxPlayPoints(2);
          },
        },
      ],
    }),
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
