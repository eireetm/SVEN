// BP16-110 Darkhaven Grace — Havencraft amulet, 4. 信仰・先導.
// {[fanfare]} Select an enemy follower on the field and destroy it.
// Activate {[engage]} this, bury this: Deal 2 damage to each enemy leader. Draw a card. Activate only if a follower on
// your field evolved this turn. (A super-evolution counts — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, p) => g.followerEvolvedThisTurn(p),
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
