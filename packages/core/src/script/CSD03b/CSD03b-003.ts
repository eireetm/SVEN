// CSD03b-003 Dragon Monk, Goku — Dragoncraft follower, 6, 5/5. ヴァンガード・かげろう.
// Ward.
// Activate {[engage]}, banish 4 Kagero cards from your cemetery: Deal 4 damage to each enemy leader and enemy follower on the field.
import { banishFromYour } from "../costs";
import { activated, defineCard } from "../helpers";
import { kagero } from "../CP03/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    activated(
      { engageSelf: true, custom: banishFromYour(["cemetery"], kagero, 4) },
      {
        *resolve(fx) {
          const opp = fx.game.opponent(fx.controller);
          yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 4);
        },
      },
    ),
  ],
});
