// CP03-017 Dolphin Soldier of High Speed Raids — Forestcraft follower, 1, 1/1. ヴァンガード・アクアフォース. Stand Trigger.
// Rush.
// {[fanfare]} Select up to 1 enemy follower on the field and engage or refresh it.
// ----------
// (If this card is revealed by a drive check, refresh a follower on your field. For the rest of this turn, it can't attack
// enemy leaders.) (Resolved by the engine, CR 14.4.5.1.3.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const [target] = fx.targets[0] ?? [];
        if (target === undefined) return;
        const [how] = yield* fx.choose([
          { id: "engage", label: "Engage it" },
          { id: "refresh", label: "Refresh it" },
        ]);
        if (how === "engage") yield* fx.engage([target]);
        else yield* fx.refresh([target]);
      },
    }),
  ],
});
