// BP10-066 Heliodragon — Dragoncraft follower, 3, 3/4. アルカナ・竜族.
// When this card is discarded, you may put it into your EX area. (Also when it's discarded down to the
// hand limit — ruling.)
// ----------
// Once on each of your turns, when you discard a card, give your leader {[defense]}+3. (Only while it
// is on the field, not in the EX area — ruling.)
import { defineCard, whenDiscarded, whenYouDiscard } from "../helpers";

export default defineCard({
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery" && (yield* fx.confirm())) yield* fx.putIntoEx([fx.self]);
      },
    }),
    whenYouDiscard(
      {
        oncePerTurn: true,
        triggerIf: (g, p) => g.activePlayer === p,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 3);
        },
      },
      () => true,
    ),
  ],
});
