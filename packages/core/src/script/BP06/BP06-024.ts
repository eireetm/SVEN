// BP06-024 Courtly Dance — Swordcraft spell, 6. 貴族・ダンサー.
// Look at the top 5 cards of your deck. From among them, you may summon any number of
// {[swordcraft]} followers that cost 3 or less each, up to a total cost of 7. Put the rest on the
// bottom of your deck in any order. (元のコスト: printed costs. They enter together — rulings.)
// Picked one at a time, each time only from those that still fit (docs/open-questions.md design
// principle: only completable choices are offered).
import type { CardId } from "../../model/ids";
import { defineCard, spell } from "../helpers";
import { and, costAtMost, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(5);
        const chosen: CardId[] = [];
        let budget = 7;
        for (;;) {
          const fits = top.filter(
            (id) => !chosen.includes(id) && and(isFollower, isClass("Swordcraft"), costAtMost(Math.min(3, budget)))(fx.game, id),
          );
          const [pick] = yield* fx.selectCards(fits, 0, 1, fx.controller, top);
          if (pick === undefined) break;
          chosen.push(pick);
          budget -= fx.game.info(pick).cost ?? 0;
        }
        yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
