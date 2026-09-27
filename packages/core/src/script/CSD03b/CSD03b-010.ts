// CSD03b-010 Chain-Attack Sutherland — Dragoncraft follower, 3, 2/2. ヴァンガード・かげろう.
// {[fanfare]} Select a Vanguard follower on your field and give it {[attack]}+3. (This one may be selected.)
// Activate {[engage]}, bury this card: Select an enemy follower on the field and deal it damage equal to this follower's attack.
// (Its attack on the field, before the cost buried it — ruling; so the cost records it.)
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { vanguard } from "../CP03/shared";

const buryThisRecordingAttack: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "field",
  *pay(fx) {
    fx.memory.attack = fx.game.info(fx.self).attack ?? 0;
    yield* fx.bury([fx.self]);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: vanguard })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 3, 0);
      },
    }),
    activated(
      { engageSelf: true, custom: buryThisRecordingAttack },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, Number(fx.memory.attack ?? 0));
        },
      },
    ),
  ],
});
