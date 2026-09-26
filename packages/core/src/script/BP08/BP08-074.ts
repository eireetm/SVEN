// BP08-074 Vuella, One-Winged Demon — Abysscraft follower, 2, 2/3. 魔界.
// Activate, pay 1: Reveal the top card. If its original cost is 2, put it into your EX area and it
// costs 2 less this turn; otherwise it returns facedown to the same position. Once per turn
// (ruling, CR 4.1.3.1, 5.21, 10.7.2.2).
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          const [top] = fx.topCards(1);
          if (top === undefined) return;
          yield* fx.reveal([top]);
          if (fx.game.info(top).cost === 2) {
            const moved = yield* fx.putIntoEx([top]);
            for (const card of moved) yield* fx.changePlayCost(card, -2, "endOfTurn");
          }
        },
      },
    ),
  ],
});
