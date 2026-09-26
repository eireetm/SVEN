// BP18-086 Exhumation Crow — Abysscraft follower, 2, 2/2. 透京・魔界・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Reveal two 2-cost cards from your hand: Give your leader {[defense]}+2. (元のコスト; CR 10.4.7.4.)
import { revealFromHand } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costsTwo } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: revealFromHand(costsTwo, 2),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
