// BP09-091 Heavenly Knight — Havencraft follower, 5, 3/7. 信仰・偶像.
// Storm. Ward.
// {[fanfare]} If there are at least 2 amulets on your field, give this follower {[attack]}+2 and your
// leader {[defense]}+2. (Both depend on the condition, as the English says; the Japanese
// "…なら、これは+2する。自分のリーダーは+2する。" allows that reading.)
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["storm", "ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "field", isAmulet) < 2) return;
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 0);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
