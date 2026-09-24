// BP05-011 Mark of the Unkilling — Forestcraft spell, 2. 絶傑・狩人.
// Select an enemy follower on the field and deal it X damage. X equals its defense minus 1. If
// there are at least 3 Hunter cards in your cemetery, draw a card. (Its current defense — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { threeHunters } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)?.zone === "field") yield* fx.dealDamage(target, (fx.game.info(target).defense ?? 0) - 1);
        if (threeHunters(fx.game, fx.controller)) yield* fx.draw(1);
      },
    }),
  ],
});
