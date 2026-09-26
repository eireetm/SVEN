// BP21-088 Malicious Blader — Abysscraft follower, 2, 2/3. キラー.
// {[fanfare]} If there are at least five 2-cost cards in your cemetery, recover 2 play points. (元のコスト.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        if (g.cards(fx.controller, "cemetery").filter((id) => g.info(id).cost === 2).length >= 5) yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
