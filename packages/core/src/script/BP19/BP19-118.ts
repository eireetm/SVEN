// BP19-118 Smeltwork Bodyguard (Evolved) — 4/4.
// Ward.
// On Evolve - Select an enemy follower on the field. If there's a follower with "Cutthroat" in its name on your field or in
// your cemetery, deal it 4 damage and give your leader {[defense]}+4. (The Japanese, Chinese and official English texts:
// +4, under the condition; the English one says "Give your leader +2" in a sentence of its own.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { cutthroatAround } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (!cutthroatAround(fx.game, fx.controller)) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
