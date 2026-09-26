// BP13-096 Pyne, Twisted Justice (Evolved) — Havencraft follower, 2/4. 狂信・キラー.
// Ward.
// On Evolve - Select up to 2 enemy followers on the field. They don't refresh during their controller's
// next start phase. (CR 7.2.3)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) yield* fx.skipNextRefresh(id);
      },
    }),
  ],
});
