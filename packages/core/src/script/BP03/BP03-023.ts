// BP03-023 Amerro, Spear Knight — Swordcraft follower, 2, 2/2. 兵士・ヒーロー.
// {[evolve]} {[cost03]}: Evolve this card.
// Strike: If another Heroic follower is on your field, +1/+1.
import { defineCard, evolveAbility, strike } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(3),
    strike({
      *resolve(fx) {
        const another = fx.game.followers(fx.controller).some((id) => id !== fx.self && hasTrait("ヒーロー")(fx.game, id));
        if (another) yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
