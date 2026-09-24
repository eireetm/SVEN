// BP05-070 Rulenye, Omen of Silence — Abysscraft follower, 3, 3/3. 絶傑・死霊術師.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]}, Necrocharge (10): Select an enemy follower that costs 3 play points or less on the
// field and destroy it. (元のコスト: printed cost; CR 13.5.1.)
// While this card is on your field, any spell an opponent plays costs 1 more. (Applied after
// "costs N" — ruling, CR 10.10.2.4.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";
import { opponentSpellsCostMore } from "./shared";

export default defineCard({
  field: opponentSpellsCostMore,
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ filter: costAtMost(3), when: (g, c) => g.necrocharge(c, 10) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
