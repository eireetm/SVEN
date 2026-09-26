// BP18-046 Brilliant Cut — Runecraft spell, 1. 透京・錬金術師・商人.
// Choose 1. (1) Select an enemy follower on the field and, if there are at least 10 cards in your banished zone, deal 2
// damage to it and its leader. (2) Draw a card. Banish the top card of your deck.
// ((1) needs its target; played from the banished zone, it is in the resolution zone and doesn't count — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { banishedCount } from "./shared";
import { banishTop } from "./shared-rune";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "damage",
          label: "(1) With 10 banished cards, 2 damage to an enemy follower and its leader",
          targets: [enemyFollower()],
          *resolve(fx) {
            if (banishedCount(fx.game, fx.controller) < 10) return;
            const target = fx.targets[0]![0]!;
            yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 2);
          },
        },
        {
          id: "draw",
          label: "(2) Draw a card, banish the top card of your deck",
          *resolve(fx) {
            yield* fx.draw(1);
            yield* banishTop(fx, 1);
          },
        },
      ],
    }),
  ],
});
