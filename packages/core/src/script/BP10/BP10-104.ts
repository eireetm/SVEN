// BP10-104 Priestess of Foresight (Evolved) — Havencraft follower, 4/7. アルカナ・信仰.
// Ward.
// On Evolve - Select up to 2 enemy followers on the field and destroy them.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
