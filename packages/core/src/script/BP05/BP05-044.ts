// BP05-044 Truth's Adjudication — Runecraft spell, 3. 絶傑・魔法使い.
// Choose one of the following. If there are at least 2 Mage followers on your field, choose up to 2
// instead. (1) Draw 2 cards. (2) Deal 3 damage to each enemy leader. (3) Select an enemy follower
// on the field and deal it 3 damage. (The target is selected before drawing — ruling, CR 10.6.2.3.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { mageFollowers } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, c) => (mageFollowers(g, c) >= 2 ? 2 : 1),
      modes: [
        {
          id: "draw",
          label: "Draw 2 cards",
          *resolve(fx) {
            yield* fx.draw(2);
          },
        },
        {
          id: "leader",
          label: "Deal 3 damage to each enemy leader",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
          },
        },
        {
          id: "follower",
          label: "Deal 3 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
      ],
    }),
  ],
});
