// BP21-048 Bell Witch — Runecraft follower, 3, 3/3. 魔法使い・学院.
// {[fanfare]} Look at the top 4 cards of your deck. From among them, you may put up to 1 Academic follower and up to 1
// Academic spell into your EX area. Put the rest on the bottom of your deck in any order. (Either one alone — ruling.)
import { defineCard, fanfare } from "../helpers";
import { isSpell } from "../targets";
import { academic, academicFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const top = fx.topCards(4);
        const [follower] = yield* fx.selectCards(top.filter((id) => academicFollower(g, id)), 0, 1, fx.controller, top);
        const [spellCard] = yield* fx.selectCards(top.filter((id) => isSpell(g, id) && academic(g, id)), 0, 1, fx.controller, top);
        const chosen = [follower, spellCard].filter((id): id is NonNullable<typeof id> => id !== undefined);
        if (chosen.length > 0) yield* fx.putIntoEx(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
      },
    }),
  ],
});
