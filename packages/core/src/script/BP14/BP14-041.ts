// BP14-041 Arctic Chimera — Runecraft follower, 6, 5/5. 魔法生物・禁忌.
// Rush.
// Strike - Select an enemy follower on the field and deal it damage equal to this follower's attack.
// {[lastwords]} - Earth Rite: Put this onto its owner's field, change its attack and defense to 2, and give
// it Storm. (CR 13.3.3.2: without Earth Rite nothing happens.)
import { changeStatsTo, defineCard, lastWords, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.info(fx.self).attack ?? 0);
      },
    }),
    lastWords({
      earthRite: { mode: "required" },
      *resolve(fx) {
        const c = fx.game.card(fx.self);
        if (c?.zone !== "cemetery") return;
        const [moved] = yield* fx.putOntoField([fx.self], c.owner);
        if (moved === undefined || fx.game.card(moved)?.zone !== "field") return;
        yield* changeStatsTo(fx, moved, { attack: 2, defense: 2 });
        yield* fx.giveKeyword(moved, "storm");
      },
    }),
  ],
});
