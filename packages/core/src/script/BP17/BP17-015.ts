// BP17-015 Sköll Lookout — Forestcraft follower, 2, 2/3. 自然・獣.
// {[fanfare]} Put a Naterran Great Tree token into your EX area.
// Activate {[engage]} this, banish a Naterran Great Tree from your field: Draw a card.
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { isTree, TREE } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
      },
    }),
    activated(
      { engageSelf: true, custom: banishFromYour(["field"], isTree) },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
