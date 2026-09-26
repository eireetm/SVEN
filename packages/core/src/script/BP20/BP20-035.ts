// BP20-035 Palace Knight — Swordcraft follower, 1, 2/2. 兵士.
// {[fanfare]} Put a Steelclad Knight token into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Steelclad Knight"]);
      },
    }),
  ],
});
