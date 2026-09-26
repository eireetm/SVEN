// BP11-099 Revolver Eagle — Havencraft follower, 2, 2/1. 荒野・信仰・鳥族.
// Storm.
// {[fanfare]} Put a Bullet Bike token into your EX area.
// {[act]} {[cost06]}: Give this follower {[attack]}+4/{[defense]}+4.
import { activated, defineCard, fanfare } from "../helpers";
import { BIKE } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([BIKE]);
      },
    }),
    activated(
      { playPoints: 6 },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 4, 4);
        },
      },
    ),
  ],
});
