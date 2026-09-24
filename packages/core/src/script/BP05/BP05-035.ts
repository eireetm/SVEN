// BP05-035 Raio, Omen of Truth — Runecraft follower, 7, 7/7. 絶傑・魔法使い.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Discard a Mage card: Select an enemy follower on the field and deal it 9 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { discardA } from "../costs";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: discardA(hasTrait("魔法使い")),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 9);
      },
    }),
  ],
});
