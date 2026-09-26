// BP18-055 Illusionist — Runecraft follower, 6, 4/5. 魔法使い.
// {[fanfare]} You may summon a non-{[runecraft]} follower that costs 6 or less from your hand and give it Rush, Assail, and
// "At the start of your end phase, return this to its owner's hand." (元のコスト; the given ability stays if this leaves,
// and triggers with the summoned card's own end-phase abilities in any order — rulings.)
import { defineCard, fanfare } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const candidates = g
          .cards(fx.controller, "hand")
          .filter((id) => isFollower(g, id) && !isClass("Runecraft")(g, id) && (g.info(id).cost ?? Infinity) <= 6);
        const [card] = yield* fx.chooseCards(candidates, 0, Math.min(1, candidates.length));
        if (card === undefined) return;
        for (const id of yield* fx.putOntoField([card])) {
          yield* fx.giveKeyword(id, "rush");
          yield* fx.giveKeyword(id, "assail");
          yield* fx.grant(id, "returnToHandAtEnd");
        }
      },
    }),
  ],
});
