// BP14-094 Chamber of Cleansing — Havencraft amulet, 1. 宴楽・狂信.
// {[fanfare]} Put 2 Fox of Invitation tokens into your EX area.
// Activate {[engage]} this, bury this: Summon a Fox of Invitation from your EX area. Activate only if there's a
// Zealot follower that costs 2 or more on your field. (元のコスト.)
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtLeast, isFollower, named } from "../targets";
import { FOX, zealot } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FOX, FOX]);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, p) => g.cards(p, "field").some((id) => and(isFollower, zealot, costAtLeast(2))(g, id)),
        *resolve(fx) {
          const foxes = fx.game.cards(fx.controller, "ex").filter((id) => named(FOX)(fx.game, id));
          yield* fx.putOntoField(yield* fx.chooseCards(foxes, Math.min(1, foxes.length), 1));
        },
      },
    ),
  ],
});
