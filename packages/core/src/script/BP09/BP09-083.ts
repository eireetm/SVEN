// BP09-083 Raven, Midnight Vampire — Abysscraft follower, 1, 2/1. 吸血鬼・キラー.
// {[fanfare]} Put a Forest Bat token into your EX area.
// Once on each of your turns, when a Forest Bat is put onto your field, deal 1 damage to each enemy
// leader. (Each copy once — ruling.)
import { defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { FOREST_BAT, forestBat } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FOREST_BAT]);
      },
    }),
    whenCardEntersYourField(
      {
        oncePerTurn: true,
        triggerIf: (g, c) => g.activePlayer === c,
        *resolve(fx) {
          yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 1);
        },
      },
      { filter: forestBat },
    ),
  ],
});
