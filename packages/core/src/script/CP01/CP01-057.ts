// CP01-057 7 More Centimeters — Abysscraft spell, 5. ウマ娘.
// This card can only be played if there are at least 20 Umamusume cards in your cemetery.
// Destroy each enemy follower on the field. Draw 3 cards. Each opponent discards 3 cards.
import { defineCard, spell } from "../helpers";
import { umamusumeInCemetery } from "./shared";

export default defineCard({
  playableIf: (g, _self, player) => umamusumeInCemetery(g, player) >= 20,
  abilities: [
    spell({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.destroy(fx.game.followers(opponent));
        yield* fx.draw(3);
        yield* fx.discard(opponent, 3, 3);
      },
    }),
  ],
});
