// BP18-076 Orca Run — Dragoncraft spell, 1. 海洋.
// {[quick]}
// Select an enemy follower on the field and deal it 2 damage. If there are at least 5 Marine cards in your cemetery, deal
// 4 damage instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { marine } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const marines = fx.game.cards(fx.controller, "cemetery").filter((id) => marine(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, marines >= 5 ? 4 : 2);
      },
    }),
  ],
});
