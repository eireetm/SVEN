// ECP01-020 Cheval Grand (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 10 Umamusume cards in your
// cemetery, deal 4 damage instead.
// Twice on each of your turns, when an enemy follower that took damage this turn from an Umamusume card you control is put from
// the field into the cemetery, draw a card, then discard a card. (Also when another card destroys it afterwards — ruling.)
import { defineCard, onEvolve, whenDamagedEnemyFollowerToCemetery } from "../helpers";
import { enemyFollower } from "../targets";
import { umamusumeInCemetery } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, umamusumeInCemetery(fx.game, fx.controller) >= 10 ? 4 : 2);
      },
    }),
    whenDamagedEnemyFollowerToCemetery(
      {
        timesPerTurn: 2,
        triggerIf: (g, c) => g.activePlayer === c,
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
      (by) => by.traits.includes("ウマ娘"),
    ),
  ],
});
