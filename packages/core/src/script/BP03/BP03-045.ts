// BP03-045 Mr. Heinlein, Shadow Mage — Runecraft follower, 5, 4/4. 魔法使い・学院.
// {[fanfare]} Put the top 4 cards of your deck into your cemetery. Recover X play points.
// X equals how many spells that put there.
// Activate {[engage]}, discard a spell: Deal 4 to an enemy follower.
import { activated, defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { enemyFollower, isSpell } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const milled = yield* fx.mill(4);
        const spells = milled.filter((id) => fx.game.info(id).type === "spell").length;
        if (spells > 0) yield* fx.recoverPlayPoints(spells);
      },
    }),
    activated({ engageSelf: true, custom: discardA(isSpell) }, {
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
