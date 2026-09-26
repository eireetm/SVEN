// BP16-107 Maeve, Guardian of Earth — Havencraft follower, 3, 3/4. 狂信・先導・光輝.
// Ward.
// {[fanfare]} Bury an amulet: Give this {[attack]}+1/{[defense]}+1. Give your leader {[defense]}+3. (An amulet on your
// field, CR 10.4.3; 10.4.7.4.)
import { buryFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: buryFromYourField(isAmulet),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
