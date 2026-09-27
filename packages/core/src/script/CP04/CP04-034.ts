// CP04-034 Matsuri — Swordcraft follower, 2, 3/2. プリコネ・NIGHTMARE.
// {[ub]} Strike - Select an enemy follower on the field and deal it 1 damage.
// Rush.
// While there's another Nightmare follower on your field, this has Assail. (A passive: losing it during an attack doesn't change
// the attack — rulings.)
import { defineCard, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { anotherOnYourField, traitOf } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    ub(
      strike({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      }),
    ),
  ],
  field: {
    keywordsFor: (g, self, card) => (card === self && anotherOnYourField(g, self, traitOf("NIGHTMARE")) ? ["assail"] : []),
  },
});
