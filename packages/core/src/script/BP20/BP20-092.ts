// BP20-092 March of the Brutes — Abysscraft spell, 6. 魔界.
// Select up to 2 enemy followers on the field. Deal 5 damage to them and 3 damage to each enemy leader. (At the same time,
// CR 5.14.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const leader = fx.game.leader(fx.game.opponent(fx.controller));
        yield* fx.dealDamages([...(fx.targets[0] ?? []).map((target) => ({ target, amount: 5 })), { target: leader, amount: 3 }]);
      },
    }),
  ],
});
