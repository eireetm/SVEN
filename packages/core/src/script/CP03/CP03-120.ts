// CP03-120 Emergency Alarmer — Havencraft follower, 1, 2/1. ヴァンガード・オラクルシンクタンク. Stand Trigger.
// {[fanfare]} Select a Vanguard follower on your field and refresh it. For the rest of this turn, it can't attack enemy leaders.
// ----------
// (If this card is revealed by a drive check, refresh a follower on your field. For the rest of this turn, it can't attack
// enemy leaders.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { vanguard } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: vanguard })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.refresh([target]);
        yield* fx.cannotAttackLeader(target, "endOfTurn");
      },
    }),
  ],
});
