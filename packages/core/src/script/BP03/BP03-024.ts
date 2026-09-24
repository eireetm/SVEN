// BP03-024 Amerro, Spear Knight (Evolved) — Swordcraft, 3/3.
// On Evolve: Select a Heroic card in your cemetery and play it for 0. It must be played (ruling).
// Any Heroic card can be selected: one that cannot be played (a follower while the field is
// full) stays in the cemetery (ruling; CR 1.3.2 an impossible action is not performed).
// Strike: If another Heroic follower is on your field, +1/+1.
import { defineCard, onEvolve, strike } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const cards = fx.game.cards(fx.controller, "cemetery").filter((id) => hasTrait("ヒーロー")(fx.game, id));
        if (cards.length === 0) return;
        const [id] = yield* fx.selectCards(cards, 1, 1);
        if (id && fx.game.canPlay(id, fx.controller, { cost: 0 })) yield* fx.playCard(id, { cost: 0 });
      },
    }),
    strike({
      *resolve(fx) {
        const another = fx.game.followers(fx.controller).some((id) => id !== fx.self && hasTrait("ヒーロー")(fx.game, id));
        if (another) yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
