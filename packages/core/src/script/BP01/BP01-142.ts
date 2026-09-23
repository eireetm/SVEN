// BP01-142 Cruel Priestess — Havencraft follower, 4, 3/3.
// {[fanfare]} Select an amulet that costs 5 play points or less in your cemetery and put it onto
// your field. (Its cost is not paid — ruling.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isAmulet, costAtMost(5)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
