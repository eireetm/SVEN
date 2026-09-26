// BP13-017 Tower Root Giant — Forestcraft follower, 6, 5/6. 精霊・植物族.
// Ward.
// At the start of your end phase, select an enemy follower on the field and engage it. It doesn't refresh
// during its controller's next start phase.
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.engage([target]);
        yield* fx.skipNextRefresh(target);
      },
    }),
  ],
});
