// CP02-019 Kyoko Igarashi (Evolved) — 7/8.
// Ward.
// On Evolve - Select up to 1 enemy follower on the field and engage or refresh it. (Selecting none leaves it as it is —
// ruling.)
// During your turn, this follower doesn't take damage. (Combat damage and ability damage alike — ruling; CR 5.14.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  field: {
    damageTaken: (g, self, damage) => (g.activePlayer === g.controller(self) ? -damage.amount : 0),
  },
  abilities: [
    onEvolve({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const [target] = fx.targets[0] ?? [];
        if (target === undefined) return;
        const [how] = yield* fx.choose([
          { id: "engage", label: "Engage it" },
          { id: "refresh", label: "Refresh it" },
        ]);
        if (how === "engage") yield* fx.engage([target]);
        else yield* fx.refresh([target]);
      },
    }),
  ],
});
