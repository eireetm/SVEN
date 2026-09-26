// BP08-015 Zealot of Unkilling — Forestcraft follower, 2, 2/3. 絶傑・狩人・キラー.
// {[fanfare]} If there are at least 3 Hunter cards in your cemetery, select an enemy follower on the
// field and give it {[attack]}-4. (Attack can become negative; such a follower deals no damage —
// ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(p, "cemetery").filter((id) => hasTrait("狩人")(g, id)).length >= 3,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -4, 0);
      },
    }),
  ],
});
