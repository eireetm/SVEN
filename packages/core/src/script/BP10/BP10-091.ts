// BP10-091 Colossal Grudge — Abysscraft spell, 4. 死者.
// This card costs 3 less to play if there's a follower with "Ghost" in its name in your EX area.
// ----------
// Select an enemy follower on the field. Deal 4 damage to it and 2 damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { ghostFollower } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => (g.cards(p, "ex").some((id) => ghostFollower(g, id)) ? -3 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 4);
        yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
