// BP07-107 Desert Pathfinder — Neutral follower, 2, 2/3. 自然・傭兵.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area. Then, if
// there are least 5 Natura cards on your field and/or in your EX area, look at the top 3 cards of
// your deck. You may reveal a Natura card from among them and add it to your hand. Put the rest on
// the bottom of your deck in any order. (This card and the new Tree count — ruling.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { countIn, natura, treeOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* treeOntoFieldOrEx(fx);
        const n = countIn(fx.game, fx.controller, "field", natura) + countIn(fx.game, fx.controller, "ex", natura);
        if (n >= 5) yield* lookAtTopCards(fx, 3, { filter: natura, to: "hand" });
      },
    }),
  ],
});
