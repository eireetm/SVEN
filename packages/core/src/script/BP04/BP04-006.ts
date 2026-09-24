// BP04-006 King Elephant (Evolved) — Forestcraft, 1/1.
// Storm.
// On Evolve: Give this follower +X/+X. X equals the number of cards in your hand.
// This follower ignores Ward.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  ignoresWard: true,
  abilities: [
    onEvolve({
      *resolve(fx) {
        const x = fx.game.cards(fx.controller, "hand").length;
        yield* fx.giveStats(fx.self, x, x);
      },
    }),
  ],
});
