// BP02-011 Elven Archery — Forestcraft spell, 1.
// Select up to 2 enemy followers on the field and deal them 1 damage. Combo (3): Deal 2 damage
// instead. (Playable with no enemy followers — ruling; CR 10.6.2.3.2, 13.2.1.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.targets[0]!, fx.game.combo(fx.controller, 3) ? 2 : 1);
      },
    }),
  ],
});
