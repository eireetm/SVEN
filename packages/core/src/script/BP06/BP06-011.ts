// BP06-011 Spiritshine — Forestcraft spell, 1. 精霊.
// Choose one of the following. (1) Select a Pixie token on your field or in your EX area and give
// it {[attack]}+2/{[defense]}+2. (2) Put 2 Fairy tokens into your EX area.
import { defineCard, spell } from "../helpers";
import { and, hasTrait, isToken } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "buff",
          label: "Give a Pixie token +2/+2",
          targets: [
            {
              count: 1,
              candidates: (g, c) =>
                [...g.cards(c, "field"), ...g.cards(c, "ex")].filter((id) => and(isToken, hasTrait("妖精"))(g, id)),
            },
          ],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
          },
        },
        {
          id: "fairies",
          label: "Put 2 Fairy tokens into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx(["Fairy", "Fairy"]);
          },
        },
      ],
    }),
  ],
});
