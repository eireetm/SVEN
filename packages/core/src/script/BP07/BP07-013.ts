// BP07-013 Ghastly Treant — Forestcraft follower, 2, 2/3. 自然・植物族.
// {[fanfare]} Put a Naterran Great Tree token into your EX area.
// Activate Banish a Naterran Great Tree from your field: Give your leader {[defense]}+3. Activate
// only once per turn.
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { TREE, isTree } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
      },
    }),
    activated(
      { custom: banishFromYour(["field"], isTree) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 3);
        },
      },
    ),
  ],
});
