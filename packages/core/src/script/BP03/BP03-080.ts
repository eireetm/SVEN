// BP03-080 Demon Maestro — Abysscraft follower, 2, 1/1. 魔界.
// Activate, give your leader -2 defense: Draw a card. Once per turn.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { leaderDefense: 2 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
