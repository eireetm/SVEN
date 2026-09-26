// BP13-002 Sekka, Ninefold Blaze — Forestcraft advanced follower, 3, 3/3. 荒野・狩人・獣.
// {[fanfare]} Choose one. (1) Search your deck for a Resolve of the Nine-Tailed Fox, reveal it, add it to
// your hand, then shuffle. (2) Select a Resolve of the Nine-Tailed Fox in your cemetery and add it to your
// hand. ((2) can't be chosen without a target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";

const RESOLVE = "Resolve of the Nine-Tailed Fox";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "search",
          label: "(1) Search your deck for a Resolve of the Nine-Tailed Fox",
          *resolve(fx) {
            yield* fx.search((id) => named(RESOLVE)(fx.game, id));
          },
        },
        {
          id: "cemetery",
          label: "(2) A Resolve of the Nine-Tailed Fox from your cemetery",
          targets: [inYourZone("cemetery", { filter: named(RESOLVE) })],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
