// BP03-114 Actress Feria — Neutral follower, 1, 2/2. シンガー・童話・プリンセス.
// Activate {[engage]}: Put a Fable counter on another Fable follower on your field.
import { activated, defineCard } from "../helpers";
import { anotherYourFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [anotherYourFollower({ filter: hasTrait("童話") })],
        *resolve(fx) {
          yield* fx.addCounters(fx.targets[0]![0]!, "fable", 1);
        },
      },
    ),
  ],
});
