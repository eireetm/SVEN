// BP04-078 Dragon's Nest — Dragoncraft amulet, 1. 竜族.
// Activate {[engage]}, put this card into its owner's cemetery: Give your leader +2 defense. If
// Overflow is active for you, draw a card.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
          if (fx.game.overflow(fx.controller)) yield* fx.draw(1);
        },
      },
    ),
  ],
});
