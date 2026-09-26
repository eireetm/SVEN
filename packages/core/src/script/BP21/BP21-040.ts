// BP21-040 Ceridwen, Eternal Duality — Runecraft follower, 3, 2/4. 錬金術師・禁忌.
// At the start of your end phase, select an enemy leader or enemy follower on the field and, if you've used Earth Rite to
// remove at least 1 Stack counters from cards on your field with Stack this turn, deal it 2 damage. (Any Earth Rite this
// turn, e.g. this card's Fanfare or Earth Rite (2) — rulings.)
// {[fanfare]} - Earth Rite: Search your deck for a follower with Earth Rite or Earth Sigil amulet that costs 1 or less, summon
// it, then shuffle. (元のコスト; CR 13.3.3.)
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { costAtMost, enemyLeaderOrFollower, isAmulet, isFollower } from "../targets";
import { earthSigil } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        if (fx.game.stackRemovedByEarthRiteThisTurn(fx.controller) >= 1) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    fanfare({
      earthRite: { mode: "required" },
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search(
          (id) => costAtMost(1)(g, id) && ((isFollower(g, id) && g.hasEarthRite(id)) || (isAmulet(g, id) && earthSigil(g, id))),
          { to: "field" },
        );
      },
    }),
  ],
});
