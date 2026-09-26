// BP12-048 Device Diviner — Runecraft follower, 2, 2/3. 機械・錬金術師.
// {[fanfare]} Put an Assembly Droid or Repair Mode token into your EX area.
// Once per turn, when you play a Machina card, give your leader {[defense]}+1. (Once in each player's
// turn — ruling.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { DROID, REPAIR, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: "droid", label: "Put an Assembly Droid into your EX area" },
          { id: "repair", label: "Put a Repair Mode into your EX area" },
        ]);
        yield* fx.tokensToEx([pick === "droid" ? DROID : REPAIR]);
      },
    }),
    whenYouPlay(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      machina,
    ),
  ],
});
