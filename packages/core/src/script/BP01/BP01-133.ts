// BP01-133 Sacred Plea — Havencraft amulet, 1.
// {[act]}{[engage]}, put this card into its owner's cemetery: Draw a card.
// {[act]}{[cost02]}, {[engage]}, put this card into its owner's cemetery: Draw 2 cards.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(2);
        },
      },
    ),
  ],
});
