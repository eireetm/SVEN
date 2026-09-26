// BP15-103 Adherent of Despair (Evolved) — Havencraft follower, 2/2. 絶傑・狂信.
// On Evolve - Select an enemy follower on the field and, if there's a follower on your field or in your cemetery
// with "Marwynn" in its name, destroy it.
// At the start of each opponent's main phase, select an enemy follower on the field. If this is reserved, the
// selected follower can't attack enemies this turn.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { despairLock, marwynnFollower } from "./shared-haven";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        const marwynn = [...g.cards(fx.controller, "field"), ...g.cards(fx.controller, "cemetery")].some((id) => marwynnFollower(g, id));
        if (marwynn) yield* fx.destroy(fx.targets[0]!);
      },
    }),
    despairLock(),
  ],
});
