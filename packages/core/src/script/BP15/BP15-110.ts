// BP15-110 Caladrius — Havencraft follower, 6, 6/6. 信仰・鳥族.
// Rush.
// {[fanfare]} Bury an amulet: Give this follower Storm. (An amulet on your field, CR 10.4.3.)
import { buryFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      cost: buryFromYourField(isAmulet),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
