// BP08-022 Roland the Incorruptible (Evolved) — Swordcraft follower, 4/5. 指揮官.
// Ward. On Evolve: refresh each of your amulets. End phase: leader +3 defense, then draw if
// Durandal is on your field. CR 5.4, 5.10, 10.7.2.
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { isAmulet, named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.refresh(fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id)));
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        if (fx.game.cards(fx.controller, "field").some((id) => named("Durandal the Incorruptible")(fx.game, id))) {
          yield* fx.draw(1);
        }
      },
    }),
  ],
});
