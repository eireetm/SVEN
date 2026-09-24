// BP05-003 Spinaria, Keeper of Enigmas — Forestcraft follower, 5, 3/5. 超克.
// Ward.
// {[fanfare]} Look at the top 4 cards of your deck. From among them, you may reveal up to 1
// {[forestcraft]} follower and up to 1 {[forestcraft]} spell and add them to your hand. Put the
// remaining cards on the bottom of your deck in any order. Combo (3): Recover 3 play points.
// (Combo works even if nothing was added — ruling; CR 13.2.1.2.)
import type { CardId } from "../../model/ids";
import { defineCard, fanfare } from "../helpers";
import { and, isClass, isFollower, isSpell } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(4);
        const picked: CardId[] = [];
        for (const kind of [isFollower, isSpell]) {
          const matching = top.filter((id) => and(kind, isClass("Forestcraft"))(fx.game, id));
          picked.push(...(yield* fx.selectCards(matching, 0, 1, fx.controller, top)));
        }
        yield* fx.reveal(picked);
        yield* fx.returnToHand(picked);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
        if (fx.game.combo(fx.controller, 3)) yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
