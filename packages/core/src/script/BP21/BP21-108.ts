// BP21-108 Hierophant's Implements — Havencraft amulet, 3. 信仰.
// Activate {[engage]} this, bury an amulet: Deal 1 damage to each enemy leader. Give your leader {[defense]}+1. (The amulet
// may be this one — ruling.)
import { buryFromYourField } from "../costs";
import { activated, defineCard } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: buryFromYourField(isAmulet) },
      {
        *resolve(fx) {
          yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 1);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
