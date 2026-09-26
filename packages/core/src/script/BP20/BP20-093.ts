// BP20-093 Marwynn, Despair Manifest — Havencraft follower, 4, 4/4. 絶傑・狂信.
// {[fanfare]} Choose one. (1) Select an enemy follower on the field and, if there are at least 3 crests in your EX area,
// banish it and give your leader {[defense]}+2. (2) Put a Crest: Marwynn, Despair Manifest token into your EX area. ((1)
// needs its target — ruling; the leader +2 too under the condition, Q10 and the English text.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { threeCrests } from "./shared-haven";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "banish",
          label: "(1) With 3 crests: banish an enemy follower, leader +2",
          targets: [enemyFollower()],
          *resolve(fx) {
            if (!threeCrests(fx.game, fx.controller)) return;
            yield* fx.banish(fx.targets[0]!);
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
        {
          id: "crest",
          label: "(2) A Crest: Marwynn, Despair Manifest into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx(["Crest: Marwynn, Despair Manifest"]);
          },
        },
      ],
    }),
  ],
});
