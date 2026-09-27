// CP04-T03 Sanctum Blade Avalon — Swordcraft equipment token, 2. プリコネ・NIGHTMARE・七冠.
// The equipped follower has "Strike - Refresh this. Draw a card. Perform only once per turn." (CR 10.7.2.2)
// (Place this beneath the equipped follower.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  equipment: {
    abilities: [
      strike({
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
          yield* fx.draw(1);
        },
      }),
    ],
  },
});
