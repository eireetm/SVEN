// BP18-018 Furious Mountain Deity — Forestcraft follower, 4, 3/4. 獣.
// Strike - Give this {[attack]}+3/{[defense]}+3.
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 3, 3);
      },
    }),
  ],
});
