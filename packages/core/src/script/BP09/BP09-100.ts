// BP09-100 Hexed Fowl of Ebon — Havencraft follower, 3, 4/3. 狂信・鳥族.
// Rush.
// {[fanfare]} If there's an amulet on your field, deal 2 damage to each enemy leader.
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "field", isAmulet) > 0) {
          yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
        }
      },
    }),
  ],
});
