// BP09-082 Raven, Noontide Vampire — Abysscraft follower, 1, 1/2. 吸血鬼・光輝.
// {[fanfare]} Put a Forest Bat token into your EX area.
// Once on each of your turns, when a Forest Bat is put onto your field, give your leader {[defense]}+1.
// (Each copy once — ruling.)
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
        condition: (g, c) => g.activePlayer === c,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { filter: forestBat },
    ),
  ],
});
