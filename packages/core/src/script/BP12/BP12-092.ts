// BP12-092 Major Prayers — Havencraft spell, 3. 自然・信仰・光輝・獣.
// Choose one. (1) Give your leader {[defense]}+2. Draw 2 cards. (2) Search your deck for up to 2
// different cards with "Meowskers" in their names, summon them, then shuffle.
import { defineCard, spell } from "../helpers";
import { nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "draw",
          label: "(1) Your leader +2 defense, draw 2",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
            yield* fx.draw(2);
          },
        },
        {
          id: "meowskers",
          label: '(2) Summon up to 2 different "Meowskers" cards from your deck',
          *resolve(fx) {
            yield* fx.search((id) => nameIncludes("Meowskers")(fx.game, id), { max: 2, to: "field", distinctNames: true });
          },
        },
      ],
    }),
  ],
});
