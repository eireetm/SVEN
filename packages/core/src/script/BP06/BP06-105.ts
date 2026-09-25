// BP06-105 Holy Counterattack — Havencraft spell, 1. 先導.
// Quick.
// This card can't be played during your turn.
// Select an engaged enemy follower on the field and deal it 2 damage. If there's a follower with
// Ward on your field, deal 4 damage instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  playableIf: (g, _self, player) => g.activePlayer !== player,
  abilities: [
    spell({
      targets: [enemyFollower({ filter: (g, id) => g.card(id)?.engaged === true })],
      *resolve(fx) {
        const ward = fx.game.followers(fx.controller).some((id) => fx.game.info(id).keywords.includes("ward"));
        yield* fx.dealDamage(fx.targets[0]![0]!, ward ? 4 : 2);
      },
    }),
  ],
});
