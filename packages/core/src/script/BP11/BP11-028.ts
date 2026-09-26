// BP11-028 Desperados' Shot — Swordcraft spell, 2. 荒野・盗賊.
// Select an enemy follower on the field and deal it 4 damage. If there's a Bunny & Baron, Specter Duo
// and Val, Trusty Getaway Car on your field, deal 6 damage instead and deal 2 damage to the selected
// follower's leader. (Without both, no damage to the leader — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        const duo =
          onYourField(fx.game, fx.controller, "Bunny & Baron, Specter Duo") && onYourField(fx.game, fx.controller, "Val, Trusty Getaway Car");
        yield* fx.dealDamage(target, duo ? 6 : 4);
        if (duo) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
