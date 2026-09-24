// BP03-021 Valiant Fencer (Evolved) — Swordcraft, 5/5.
// On Evolve: Select a Heroic follower with {[evolve]} on your field and evolve it.
// The selected follower's evolve cost is not paid (ruling). The controller may decline (ruling).
// Its On Evolve then triggers (CR 5.16.1.3).
import { defineCard, onEvolve } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const heroes = fx.game.followers(fx.controller).filter((id) => {
          const card = fx.game.card(id);
          return (
            card !== undefined &&
            hasTrait("ヒーロー")(fx.game, id) &&
            !fx.game.info(id).evolved &&
            fx.game.hasEvolveAbility(card.def)
          );
        });
        if (heroes.length === 0) return;
        const [id] = yield* fx.selectCards(heroes, 1, 1);
        if (id) yield* fx.evolve(id);
      },
    }),
  ],
});
