// BP09-099 Holy Fowl of Ivory — Havencraft follower, 3, 3/4. 信仰・鳥族.
// Ward.
// {[fanfare]} If there's an amulet on your field, give your leader {[defense]}+2.
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "field", isAmulet) > 0) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
