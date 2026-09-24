// BP05-033 Usurping Spineblade — Swordcraft spell, 2. 絶傑・盗賊.
// Quick.
// Select an enemy follower on the field. Deal it 3 damage, and each opponent puts the top card of
// their deck into their cemetery. Then, if there are at least 10 cards in opponents' cemeteries,
// deal 2 more damage to the selected follower. (Two separate instances of damage, the second even
// when the first brought it to 0 — ruling; it is destroyed after the spell, CR 11.3.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { opponentCemeteryTen } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamage(target, 3);
        yield* fx.mill(1, fx.game.opponent(fx.controller));
        if (opponentCemeteryTen(fx.game, fx.controller)) yield* fx.dealDamage(target, 2);
      },
    }),
  ],
});
