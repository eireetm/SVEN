// BP08-095 Battlefield Inquisitor — Havencraft follower, 8, 5/5. 狂信・キラー.
// Fanfare: select up to 2 enemy cards, destroy them, and draw a card. Selecting none still draws
// (ruling; CR 5.6, 5.10, 10.6.2.3.2).
import { defineCard, fanfare } from "../helpers";
import { enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyCardOnField({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.draw(1);
      },
    }),
  ],
});
