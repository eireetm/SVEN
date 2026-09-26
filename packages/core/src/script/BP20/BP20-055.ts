// BP20-055 Wasteland of Destruction — Runecraft amulet, 1. 絶傑・アイドル.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a card with Omen and Idolatry traits from among them and
// add it to your hand. Put the rest on the bottom of your deck in any order.
// Activate Bury this: Bury another Idolatry card on your field. (Also without another one: then only this is buried —
// ruling.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { idolatry, omenIdolatry } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: omenIdolatry, to: "hand" });
      },
    }),
    activated(
      { burySelf: true },
      {
        *resolve(fx) {
          const others = fx.game.cards(fx.controller, "field").filter((id) => id !== fx.self && idolatry(fx.game, id));
          if (others.length > 0) yield* fx.bury(yield* fx.chooseCards(others, 1, 1));
        },
      },
    ),
  ],
});
