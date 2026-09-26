// BP21-054 Binding Ritual — Runecraft amulet, 1. 魔法使い・土の印.
// Stack.
// {[fanfare]} Select an enemy follower on the field and engage it. It doesn't refresh during its controller's next start
// phase. (An engaged one can be selected: the rest applies — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.engage([target]);
        yield* fx.skipNextRefresh(target);
      },
    }),
  ],
});
