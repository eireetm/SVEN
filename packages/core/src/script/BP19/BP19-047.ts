// BP19-047 Devoted Researcher (Evolved) — 2/2.
// On Evolve - Search your deck for a Volunteer Test Subject, put it into your EX area, then shuffle.
// Activate {[engage]} this and bury a Volunteer Test Subject or Multi-Headed Test Subject on your field: Select an enemy
// follower on the field and deal it damage equal to the attack of the buried follower. (Its attack there.)
import type { CustomCost } from "../types";
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower, named } from "../targets";
import { VOLUNTEER } from "./shared";
import { testSubject } from "./shared-rune";

const burySubject: CustomCost = {
  canPay: (g, c) => g.followers(c).some((id) => testSubject(g, id)),
  *pay(fx) {
    const subjects = fx.game.followers(fx.controller).filter((id) => testSubject(fx.game, id));
    const [chosen] = yield* fx.chooseCards(subjects, 1, 1);
    if (chosen === undefined) return;
    fx.memory.buriedAttack = fx.game.info(chosen).attack ?? 0;
    yield* fx.bury([chosen]);
  },
};

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named(VOLUNTEER)(fx.game, id), { to: "ex" });
      },
    }),
    activated(
      { engageSelf: true, custom: burySubject },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const x = fx.memory.buriedAttack;
          if (typeof x === "number" && x > 0) yield* fx.dealDamage(fx.targets[0]![0]!, x);
        },
      },
    ),
  ],
});
