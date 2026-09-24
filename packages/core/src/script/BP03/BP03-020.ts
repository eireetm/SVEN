// BP03-020 Valiant Fencer — Swordcraft follower, 3, 2/2. 指揮官・ヒーロー.
// {[evolve]} {[cost01]}: Evolve, only if you have 2 or fewer cards in hand.
// {[fanfare]} Search for a Heroic card with a different name. Not finding one is allowed (CR 4.1.2.2, ruling).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    { ...evolveAbility(1), condition: (g, p) => g.cards(p, "hand").length <= 2 },
    fanfare({
      *resolve(fx) {
        const mine = fx.game.info(fx.self).name;
        yield* fx.search((id) => hasTrait("ヒーロー")(fx.game, id) && fx.game.info(id).name !== mine);
      },
    }),
  ],
});
