// ECP02-041 Riamu Yumemi [Party Night] — Dragoncraft follower, 8, 7/7. デレマス・パッション.
// {[fanfare]} Deal 7 damage to each enemy follower on the field. If there are at least 3 Cute cards, at least 3 Cool cards, and at
// least 3 Passion cards in your cemetery, give this Storm and recover 1 play point. (A card with several of the types counts for
// each — ruling.)
// {[q]}Activate {[cost01]}, Lesson (1), discard this: Select an enemy follower on the field and deal it 2 damage. (Valid in the
// hand — ruling, CR 10.3.5.)
import { allCosts, discardThis, lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { cool, cute, inYourCemetery, passion } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.dealDamageEach(g.followers(g.opponent(fx.controller)), 7);
        if (![cute, cool, passion].every((type) => inYourCemetery(g, fx.controller, type) >= 3)) return;
        if (g.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        yield* fx.recoverPlayPoints(1);
      },
    }),
    activated(
      { playPoints: 1, custom: allCosts(lesson(1), discardThis) },
      {
        quick: true,
        validIn: ["hand"],
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
  ],
});
