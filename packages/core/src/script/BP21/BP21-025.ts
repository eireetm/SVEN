// BP21-025 Weiss, Discerning Professor — Swordcraft follower, 5, 4/4. 学院・超克・キラー.
// At the start of your end phase, select an enemy leader or enemy follower on the field and deal it damage equal to the number
// of other Academic followers on your field.
// {[fanfare]} Look at the top 5 cards of your deck. You may summon up to 2 Academic followers that cost a total of 4 or less
// from among them. Put the rest on the bottom of your deck in any order. (元のコスト.)
import { atStartOfYourEndPhase, defineCard, fanfare, selectWithinTotalCost } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { academicFollower } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        const x = fx.game.cards(fx.controller, "field").filter((id) => id !== fx.self && academicFollower(fx.game, id)).length;
        if (x > 0) yield* fx.dealDamage(fx.targets[0]![0]!, x);
      },
    }),
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        const chosen = yield* selectWithinTotalCost(fx, top.filter((id) => academicFollower(fx.game, id)), 4, 2, top);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
