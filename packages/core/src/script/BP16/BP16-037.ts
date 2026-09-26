// BP16-037 Anne & Grea, Mysterian Duo — Runecraft follower, 5, 4/4. 魔法使い・学院・プリンセス.
// While there are at least 10 Academic cards in your cemetery, this has Storm.
// {[fanfare]} Discard 2 Academic cards: Select an enemy follower on the field. Deal it 5 damage and draw 2 cards.
// (Not without a target — ruling; CR 10.4.7.4.)
// At the start of your end phase, if there are at least 5 Academic cards in your cemetery, summon an Anne's
// Summoning token.
import { discardMatching } from "../costs";
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { academic } from "./shared";
import { academicInCemetery } from "./shared-rune";

export default defineCard({
  selfKeywords: (g, self) => (academicInCemetery(g, g.controller(self)) >= 10 ? ["storm"] : []),
  abilities: [
    fanfare({
      cost: discardMatching(academic, 2),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.draw(2);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, p) => academicInCemetery(g, p) >= 5,
      *resolve(fx) {
        yield* fx.summon(["Anne's Summoning"]);
      },
    }),
  ],
});
