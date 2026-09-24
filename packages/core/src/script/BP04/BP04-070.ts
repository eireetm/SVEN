// BP04-070 Cetus (Evolved) — Dragoncraft, 6/6.
// On Evolve: Destroy each of the lowest-cost enemy followers on the field.
// Cost is the printed cost, an evolved follower's is its base card's, and every follower tied for
// the lowest is destroyed (rulings).
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const foes = fx.game.followers(fx.game.opponent(fx.controller));
        if (foes.length === 0) return;
        const cost = (id: string) => fx.game.info(id).cost ?? 0;
        const lowest = Math.min(...foes.map(cost));
        yield* fx.destroy(foes.filter((id) => cost(id) === lowest));
      },
    }),
  ],
});
