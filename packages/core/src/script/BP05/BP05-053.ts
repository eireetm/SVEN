// BP05-053 Galmieux, Omen of Disdain (Evolved) — Dragoncraft follower, 6/6. 絶傑・竜族.
// On Evolve: Select an Omen card that costs 2 play points or less in your cemetery and play it for
// 0 play points. (元のコスト: printed cost. If it can't be played then, nothing happens.)
// During your turn, whenever this follower takes ability damage, select an enemy leader or enemy
// follower on the field and deal it 3 damage. (Also when that damage destroys it: the ability
// resolves after it is destroyed — ruling.)
import { defineCard, onEvolve, whenThisTakesDamage } from "../helpers";
import { and, costAtMost, enemyLeaderOrFollower, hasTrait, inYourZone } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(hasTrait("絶傑"), costAtMost(2)) })],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        if (fx.game.card(card)?.zone !== "cemetery") return;
        if (fx.game.canPlay(card, fx.controller, { cost: 0 })) yield* fx.playCard(card, { cost: 0 });
      },
    }),
    whenThisTakesDamage(
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { ability: true, onlyYourTurn: true },
    ),
  ],
});
