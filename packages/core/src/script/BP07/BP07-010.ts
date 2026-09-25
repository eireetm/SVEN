// BP07-010 Avatar of Fruition — Forestcraft follower, 2, 3/2. 自然・精霊.
// {[fanfare]} Put a Naterran Great Tree token into your EX area.
// While this card is on your field, any Naterran Great Tree you play costs 1 less.
import { defineCard, fanfare } from "../helpers";
import { TREE, isTree } from "./shared";

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) => (player === g.controller(self) && isTree(g, card) ? -1 : 0),
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
      },
    }),
  ],
});
