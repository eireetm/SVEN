// CP04-101 Misato — Havencraft follower, 1, 2/2. プリコネ・フォレスティエ.
// {[ub]}{[fanfare]} Bury an amulet: Give your leader {[defense]}+2. (An amulet on your field. Not paid, it isn't executed — ruling.)
// Ward.
import { buryFromYourField } from "../costs";
import { defineCard, fanfare, ub } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      fanfare({
        cost: buryFromYourField(isAmulet, 1),
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      }),
    ),
  ],
});
