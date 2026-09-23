// BP01-130 Arch Priestess Laelia (Evolved) — 0/6.
// While this card is on your field, your followers deal damage equal to their defense.
// At the start of your end phase, give this follower +2 defense.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  field: { combatDamageFromDefense: true },
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 0, 2);
      },
    }),
  ],
});
