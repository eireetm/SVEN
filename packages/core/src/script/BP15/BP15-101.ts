// BP15-101 Perpetual Despair — Havencraft amulet, 1. 絶傑・狂信.
// Whenever a follower with "Marwynn" in its name is put onto your field, you may put this from your cemetery into
// your EX area. If you do, give your leader {[defense]}+1. (Valid in the cemetery — ruling.)
// ----------
// Activate {[engage]} this, bury this: Draw a card.
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { marwynnFollower } from "./shared-haven";

export default defineCard({
  abilities: [
    {
      ...whenFollowerEntersYourField(
        {
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone !== "cemetery" || !(yield* fx.confirm())) return;
            const [moved] = yield* fx.putIntoEx([fx.self]);
            if (moved !== undefined) yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        },
        { filter: marwynnFollower },
      ),
      validIn: ["cemetery"],
    },
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
