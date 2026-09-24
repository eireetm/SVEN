// BP05-045 Monochromatic Destruction — Runecraft spell, 2. 絶傑・アイドル.
// Quick.
// Select an enemy follower on the field. Deal it 2 damage and, if there are at least 2 Idolatry
// cards on your field, deal 2 damage to its leader and give your leader {[defense]}+2. (Both parts
// need the 2 Idolatry cards — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { idolatryOnField } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 2);
        if (idolatryOnField(fx.game, fx.controller) < 2) return;
        yield* fx.dealDamage(leader, 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
