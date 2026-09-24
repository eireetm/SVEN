// BP05-091 Hakrabi — Havencraft follower, 3, 4/3. 先導・狂信.
// Ward.
// {[fanfare]} Discard an amulet: Search your deck for an amulet that costs 1 play point, put it onto
// your field, then shuffle your deck. (元のコスト: printed cost.)
import { defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardA(isAmulet),
      *resolve(fx) {
        yield* fx.search((id) => isAmulet(fx.game, id) && fx.game.info(id).cost === 1, { to: "field" });
      },
    }),
  ],
});
