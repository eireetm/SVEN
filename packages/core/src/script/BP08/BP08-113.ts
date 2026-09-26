// BP08-113 Treasure Map — Neutral spell, 3. 傭兵.
// Look at the top 7; optionally reveal up to one follower and up to one amulet and add them to hand,
// then put the rest on the bottom in any order. CR 5.11, 5.21.
import type { CardId } from "../../model/ids";
import { defineCard, spell } from "../helpers";
import { isAmulet, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(7);
        const chosen: CardId[] = [];
        chosen.push(...(yield* fx.selectCards(top.filter((id) => isFollower(fx.game, id)), 0, 1, fx.controller, top)));
        chosen.push(...(yield* fx.selectCards(top.filter((id) => isAmulet(fx.game, id)), 0, 1, fx.controller, top)));
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
