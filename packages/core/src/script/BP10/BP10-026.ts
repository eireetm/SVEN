// BP10-026 Aerial Slash — Swordcraft spell, 1. 兵士・ヒーロー.
// {[act]} {[cost01]}, banish this card from your cemetery: Deal 3 damage to each enemy leader.
// Activate only if there are at least 5 other Heroic cards in your cemetery. (Valid in the cemetery
// — ruling, CR 10.3.5.)
// ----------
// Select an enemy follower on the field and deal it 2 damage.
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        condition: (g, p, self) => g.cards(p, "cemetery").filter((id) => id !== self && hasTrait("ヒーロー")(g, id)).length >= 5,
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
        },
      },
    ),
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
