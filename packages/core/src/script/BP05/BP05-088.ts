// BP05-088 Deus Ex Machina — Havencraft follower, 5, 4/6. 先導・超克.
// At the start of your end phase, choose one of the following. (1) Discard your hand. Draw 4 cards.
// (2) Recover 4 play points. ((1) draws 4 even with an empty hand — ruling.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      modes: [
        {
          id: "draw",
          label: "Discard your hand, then draw 4 cards",
          *resolve(fx) {
            yield* fx.discardHand();
            yield* fx.draw(4);
          },
        },
        {
          id: "recover",
          label: "Recover 4 play points",
          *resolve(fx) {
            yield* fx.recoverPlayPoints(4);
          },
        },
      ],
    }),
  ],
});
