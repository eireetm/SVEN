// BP08-109 Slash of the One — Neutral spell, 3. 絶傑.
// Destroy an enemy card costing 4 or less; if your hand has at most 2 cards after this spell left
// it for the resolution zone, deal 2 to that card's leader (ruling; CR 4.11, 5.6, 5.14).
import { defineCard, spell } from "../helpers";
import { costAtMost, enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyCardOnField({ filter: costAtMost(4) })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        if (fx.game.cards(fx.controller, "hand").length <= 2) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
