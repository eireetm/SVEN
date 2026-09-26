// BP17-111 Maisha, Purgation's Vessel (Evolved) — 3/3.
// While there are at least 10 followers in your cemetery, this has Storm. (A passive ability — ruling.)
// On Evolve - Draw a card.
// {[act]} {[cost00]}: Select an enemy follower on the field and deal it 4 damage for every 5 followers in your cemetery.
// Activate only once per turn.
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { followersInCemetery } from "./shared-neutral";

export default defineCard({
  selfKeywords: (g, self) => (followersInCemetery(g, g.controller(self)) >= 10 ? ["storm"] : []),
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          const damage = 4 * Math.floor(followersInCemetery(fx.game, fx.controller) / 5);
          if (damage > 0) yield* fx.dealDamage(fx.targets[0]![0]!, damage);
        },
      },
    ),
  ],
});
