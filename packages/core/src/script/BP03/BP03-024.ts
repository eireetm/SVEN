// BP03-024 Amerro, Spear Knight (Evolved) — Swordcraft, 3/3.
// On Evolve: Select a Heroic card in your cemetery and play it for 0. It must be played (ruling).
// Only cards that can actually be played are offered (a follower stays in the cemetery when the
// field is full — same result as the ruling, and illegal plays are not offered).
// Strike: If another Heroic follower is on your field, +1/+1.
import { defineCard, onEvolve, strike } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const cards = fx.game.cards(fx.controller, "cemetery").filter(
          (id) => hasTrait("ヒーロー")(fx.game, id) && fx.game.canPlay(id, fx.controller, { cost: 0 }),
        );
        if (cards.length === 0) return;
        const [id] = yield* fx.selectCards(cards, 1, 1);
        if (id) yield* fx.playCard(id, { cost: 0 });
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
