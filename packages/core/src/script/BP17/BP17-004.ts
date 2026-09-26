// BP17-004 Setus, Sunlit Hero — Forestcraft follower, 4, 4/5. 獣.
// Ward.
// Once on each of your turns, when you play a Beast card, recover 1 play point. (Not for this card itself: it isn't on
// the field when played — ruling.)
// {[fanfare]} Do the following 2 times. "Put the top card of your deck into your EX area. If it's a Beast card, give
// your leader {[defense]}+2."
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { beast, yourTurn } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    whenYouPlay(
      {
        triggerIf: yourTurn,
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.recoverPlayPoints(1);
        },
      },
      beast,
    ),
    fanfare({
      *resolve(fx) {
        for (let i = 0; i < 2; i++) {
          const [card] = yield* fx.topToEx(1);
          if (card !== undefined && beast(fx.game, card)) yield* fx.giveLeaderDefense(fx.controller, 2);
        }
      },
    }),
  ],
});
