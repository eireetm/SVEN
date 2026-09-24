// BP03-036 Ironwrought Defender — Swordcraft follower, 1, 2/2. 兵士・ヒーロー.
// {[fanfare]} If at least 2 Heroic cards are in your cemetery, +1 defense and Ward.
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const n = fx.game.cards(fx.controller, "cemetery").filter((id) => hasTrait("ヒーロー")(fx.game, id)).length;
        if (n >= 2) {
          yield* fx.giveStats(fx.self, 0, 1);
          yield* fx.giveKeyword(fx.self, "ward");
        }
      },
    }),
  ],
});
