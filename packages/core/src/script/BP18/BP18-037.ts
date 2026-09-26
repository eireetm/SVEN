// BP18-037 Holy Bear Knight — Swordcraft follower, 2, 2/3. 兵士・獣.
// Ward.
// {[fanfare]} {[cost02]} Give this {[attack]}+2/{[defense]}+2. Draw a card. (CR 10.4.7.4.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
