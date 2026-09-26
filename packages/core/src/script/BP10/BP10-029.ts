// BP10-029 Empress of Serenity — Swordcraft follower, 3, 1/2. アルカナ・貴族.
// {[fanfare]} Summon 2 Shield Guardian tokens
// {[fanfare]} {[cost03]} Give each follower with Ward on your field {[attack]}+1/{[defense]}+2.
// (The two Fanfares resolve in the order you choose — ruling.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Shield Guardian", "Shield Guardian"]);
      },
    }),
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) if (fx.game.hasKeyword(id, "ward")) yield* fx.giveStats(id, 1, 2);
      },
    }),
  ],
});
