// BP17-092 Relic Goddess — Havencraft advanced follower, 7, 6/6. 信仰・偶像.
// At the start of your end phase, give your leader {[defense]}+1 for every 2 amulets on your field.
// This can't be destroyed by abilities or take ability damage. (Ability damage is all damage except a fight's and an
// attack on a leader, CR 5.14.3.3; burying it still works — rulings; CR 1.3.3.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { amuletsOnField } from "./shared-haven";

export default defineCard({
  cannotBeDestroyedByAbilities: true,
  field: { damageTaken: (_g, _self, damage) => (damage.kind === "ability" ? -damage.amount : 0) },
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const plus = Math.floor(amuletsOnField(fx.game, fx.controller) / 2);
        if (plus > 0) yield* fx.giveLeaderDefense(fx.controller, plus);
      },
    }),
  ],
});
