// BP10-061 Slaughtering Dragonewt (Evolved) — Dragoncraft follower, 4/6. アルカナ・ドラゴニュート.
// On Evolve - Deal 2 damage to each enemy leader and enemy follower on the field for every 5 cards in
// your banished zone. (One damage of 2 × N, not N damages of 2 — ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const x = 2 * Math.floor(fx.game.cards(fx.controller, "banished").length / 5);
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], x);
      },
    }),
  ],
});
