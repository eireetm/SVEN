// ECP01-007 Sakura Bakushin O — Forestcraft follower, 1, 1/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Storm.
// Strike - If there are 3 or 4 Umamusume cards on your field, draw a card, then discard a card. If there are 5, draw a card.
// (Counted when it resolves, before the defending player's Quick timing — ruling.)
import { defineCard, serveAbility, strike } from "../helpers";
import { umamusumeOnYourField } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    serveAbility(1, 1),
    strike({
      *resolve(fx) {
        const n = umamusumeOnYourField(fx.game, fx.controller);
        if (n === 3 || n === 4) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        }
        if (umamusumeOnYourField(fx.game, fx.controller) === 5) yield* fx.draw(1);
      },
    }),
  ],
});
