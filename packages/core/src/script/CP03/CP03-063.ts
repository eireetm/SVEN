// CP03-063 Dragonic Overlord the End — Dragoncraft follower, 7, 6/6. ヴァンガード・かげろう.
// Storm. Ward. Twin Drive.
// {[fanfare]} If there's a Dragonic Overlord in your cemetery, recover 1 play point. (Only that name, not another Dragonic
// Overlord the End — ruling. Dragonic Overlord is CSD03b-001, not in the supported sets yet.)
// Strike - {[cost03]}, discard a Dragonic Overlord the End: Refresh this follower. (An optional cost, CR 10.4.7.4.)
// Activate Banish 5 Kagero cards from your cemetery: Destroy each other follower on the field. (Both fields — ruling.)
import { allCosts, banishFromYour, discardA, playPointsCost } from "../costs";
import { activated, defineCard, fanfare, strike } from "../helpers";
import { named } from "../targets";
import { kagero } from "./shared";

export default defineCard({
  keywords: ["storm", "ward", "twinDrive"],
  abilities: [
    fanfare({
      condition: (g, c) => g.cards(c, "cemetery").some((id) => named("Dragonic Overlord")(g, id)),
      *resolve(fx) {
        yield* fx.recoverPlayPoints(1);
      },
    }),
    strike({
      cost: allCosts(playPointsCost(3), discardA(named("Dragonic Overlord the End"))),
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
    activated(
      { custom: banishFromYour(["cemetery"], kagero, 5) },
      {
        *resolve(fx) {
          const g = fx.game;
          yield* fx.destroy([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))].filter((id) => id !== fx.self));
        },
      },
    ),
  ],
});
