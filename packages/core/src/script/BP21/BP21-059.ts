// BP21-059 Grand Slam Tamer — Dragoncraft follower, 2, 2/2. 竜使い・学院.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If Overflow is active for you, look at the top 3 cards of your deck. You may reveal an Academic card from among
// them and add it to your hand. Put the rest on the bottom of your deck in any order. (Max play points at least 7, CR 13.4.1.2.)
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { academic } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* lookAtTopCards(fx, 3, { filter: academic, to: "hand" });
      },
    }),
  ],
});
