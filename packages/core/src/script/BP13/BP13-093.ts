// BP13-093 Absolute Tolerance — Havencraft follower, 15, 10/10. 信仰・偶像・超克.
// This card costs 5 less to play if there are no cards on your field. This card costs 5 less to play if
// there are 2 other cards or less in your hand. This card costs 5 less to play if there are at least 15
// cards in your cemetery. (Each one that holds, CR 10.4.4.1 — ruling.)
// ----------
// {[fanfare]} Select an enemy follower on the field and destroy it.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playCost: (g, self, p) =>
    (g.cards(p, "field").length === 0 ? -5 : 0) +
    (g.cards(p, "hand").filter((id) => id !== self).length <= 2 ? -5 : 0) +
    (g.cards(p, "cemetery").length >= 15 ? -5 : 0),
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
