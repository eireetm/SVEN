// BP11-048 Rivaylian Deputy — Runecraft follower, 2, 1/2. 荒野・魔法使い.
// {[fanfare]} Summon a Dutiful Steed token.
// Once on each of your turns, when a Mount card is put onto your field, draw a card, then discard a
// card. (Each Deputy once — ruling.)
import { defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { mount, STEED, yourTurn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([STEED]);
      },
    }),
    whenCardEntersYourField(
      {
        oncePerTurn: true,
        triggerIf: yourTurn,
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
      { filter: mount },
    ),
  ],
});
