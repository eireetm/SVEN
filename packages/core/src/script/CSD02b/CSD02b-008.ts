// CSD02b-008 Kako Takafuji (Evolved) — 3/3.
// On Evolve - {[cost03]}: Select an enemy leader and deal it 3 damage. (CR 10.4.7.4.)
import { playPointsCost } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyLeader } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: playPointsCost(3),
      targets: [enemyLeader()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
