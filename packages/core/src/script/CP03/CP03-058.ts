// CP03-058 Skyhigh Walker — Runecraft follower, 1, 1/2. ヴァンガード・ペイルムーン. Stand Trigger.
// Activate Banish this card: Select another Pale Moon follower on your field and refresh it. For the rest of this turn, it can't
// attack enemy leaders.
// ----------
// (If this card is revealed by a drive check, refresh a follower on your field. For the rest of this turn, it can't attack
// enemy leaders.) (Resolved by the engine.)
import { banishThis } from "../costs";
import { activated, defineCard } from "../helpers";
import { anotherYourFollower } from "../targets";
import { paleMoon } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { custom: banishThis },
      {
        targets: [anotherYourFollower({ filter: paleMoon })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.refresh([target]);
          yield* fx.cannotAttackLeader(target, "endOfTurn");
        },
      },
    ),
  ],
});
