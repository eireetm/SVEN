// BP02-106 Dark Angel Olivia — Neutral follower, 5, 5/5.
// {[fanfare]} Choose up to 2 of the following. (1) Gain 1 Evolution Point. (2) Give your leader
// {[defense]}+3. (3) Draw a card. (4) Each opponent discards a card.
// (CR 5.18.2.1: at least one, each at most once; evolution points have no upper limit, also for the
// first player — rulings; CR 3.2.5.1.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      modeCount: () => 2,
      modes: [
        {
          id: "1",
          label: "Gain 1 Evolution Point",
          *resolve(fx) {
            yield* fx.gainEvolutionPoints(1);
          },
        },
        {
          id: "2",
          label: "Give your leader +3 defense",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 3);
          },
        },
        {
          id: "3",
          label: "Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
        {
          id: "4",
          label: "Each opponent discards a card",
          *resolve(fx) {
            yield* fx.discard(fx.game.opponent(fx.controller), 1, 1);
          },
        },
      ],
    }),
  ],
});
