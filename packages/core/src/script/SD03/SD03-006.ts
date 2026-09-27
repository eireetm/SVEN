// SD03-006 Fire Chain — Runecraft spell, 2. 魔法使い. {[quick]}
// Select up to 2 enemy followers on the field and deal 3 damage divided between them. (0 may be selected; every selected follower
// gets at least 1 — rulings, CR 10.6.2.4.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], 3);
      },
    }),
  ],
});
