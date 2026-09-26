// BP13-087 Sanguine Necklace — Abysscraft amulet, 1. 吸血鬼.
// Activate {[engage]}, bury this card: Deal 1 damage to your leader. Draw a card.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
