// BP08-071 Nephthys — Abysscraft follower, 7, 5/5. 死者・死霊術師.
// {[fanfare]} Look at the top 7 cards. You may put up to 4 differently named Abysscraft followers
// with original cost 6 or less onto the field, bottom the rest, then destroy every follower put out
// this way. All Fanfares and Last Words wait until Nephthys finishes, then are ordered normally
// (rulings, CR 5.5, 5.6, 10.7.3.1).
import type { CardId } from "../../model/ids";
import { defineCard, fanfare } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(7);
        yield* fx.lookAt(top);
        let candidates = top.filter(
          (id) => isFollower(fx.game, id) && isClass("Abysscraft")(fx.game, id) && (fx.game.info(id).cost ?? 99) <= 6,
        );
        const chosen: CardId[] = [];
        while (chosen.length < 4 && candidates.length > 0) {
          const [card] = yield* fx.chooseCards(candidates, 0, 1);
          if (card === undefined) break;
          chosen.push(card);
          const name = fx.game.info(card).name;
          candidates = candidates.filter((id) => fx.game.info(id).name !== name);
        }
        const summoned = yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
        yield* fx.destroy(summoned);
      },
    }),
  ],
});
