// CP04-040 Neneka — Runecraft follower, 2, 0/1. プリコネ・七冠.
// {[ub]}{[fanfare]} If there's no Mirror Image Neneka on your field, summon one. (Played and resolved even if there is one, so it
// is executed then too, CR 14.5.1.3.)
// {[fanfare]} {[cost02]} Equip this with a Mirage Wand token.
// Activate {[engage]} this: Select an enemy follower on the field and deal it 1 damage.
import { activated, defineCard, equipFanfare, fanfare, ub } from "../helpers";
import { enemyFollower, named } from "../targets";

const MIRROR_IMAGE = "Mirror Image Neneka";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          if (fx.game.cards(fx.controller, "field").some((id) => named(MIRROR_IMAGE)(fx.game, id))) return;
          yield* fx.summon([MIRROR_IMAGE]);
        },
      }),
    ),
    equipFanfare("Mirage Wand", 2),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
