// BP17-057 Disrestan, Ocean Harbinger — Dragoncraft follower, 5, 5/5. 海洋.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard a Marine card: Do the following 3 times. "Put the top card of your deck into your EX area."
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { marine } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardA(marine),
      *resolve(fx) {
        for (let i = 0; i < 3; i++) yield* fx.topToEx(1);
      },
    }),
  ],
});
