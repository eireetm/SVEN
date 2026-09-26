// BP17-061 Verdant Rebirth — Dragoncraft spell, 3. 自然・ドラゴニュート.
// This costs X less to play. X equals the number of cards named Naterran Great Tree that left your field this turn.
// ----------
// Select an enemy follower on the field and deal it 5 damage.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { TREE } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => -g.cardsLeftFieldThisTurn(p).filter((c) => c.names.includes(TREE)).length,
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
