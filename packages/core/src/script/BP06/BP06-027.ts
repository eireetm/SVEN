// BP06-027 Twinsword Master — Swordcraft follower, 2, 1/3. 兵士.
// Strike: Refresh this follower. Perform only once per turn. (CR 10.7.2.2)
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      oncePerTurn: true,
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
