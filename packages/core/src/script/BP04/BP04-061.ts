// BP04-061 Lævateinn Dragon, Defense Form — Dragoncraft evolved follower, 5/7. 竜族・武装.
// Evolved into from BP03-056 ("an evolved follower with Lævateinn Dragon in its name").
// Ward.
// Reduce damage dealt to this follower by 1 (all damage — ruling; CR 5.14.2).
// At the start of your end phase, give your leader +3 defense.
// This follower's name is also Lævateinn Dragon (on the field only).
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  alsoNames: ["Lævateinn Dragon"],
  field: { damageTaken: () => -1 },
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
