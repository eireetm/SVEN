// BP07-116 Mechagun Wielder — Neutral follower, 1, 1/2. 機械・傭兵.
// {[fanfare]} Put an Assembly Droid or Repair Mode token into your EX area.
// {[lastwords]} Discard a Machina card: Draw a card. (CR 10.4.7.4)
import { discardA } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";
import { droidOrRepairToEx, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({ resolve: droidOrRepairToEx }),
    lastWords({
      cost: discardA(machina),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
