// BP19-021 Radiel, Valorous Enforcer — Swordcraft follower, 7, 6/8. 八獄・指揮官.
// Storm. Ward.
// Strike - If there are 10 {[swordcraft]} followers on your field and/or in your EX area, refresh this. Activate only twice
// per turn. (CR 10.7.2.2; checked as it resolves, before the quick window — ruling; 「10枚なら」 is exactly 10.)
// {[fanfare]} If there are at least 5 {[swordcraft]} followers on your field and/or in your EX area, banish each enemy
// follower on the field.
import { defineCard, fanfare, strike } from "../helpers";
import { swordFollowersAround } from "./shared-sword";

export default defineCard({
  keywords: ["storm", "ward"],
  abilities: [
    strike({
      timesPerTurn: 2,
      *resolve(fx) {
        if (swordFollowersAround(fx.game, fx.controller) === 10 && fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
    fanfare({
      *resolve(fx) {
        if (swordFollowersAround(fx.game, fx.controller) >= 5) yield* fx.banish(fx.game.followers(fx.game.opponent(fx.controller)));
      },
    }),
  ],
});
