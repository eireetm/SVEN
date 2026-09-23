// BP01-084 Wyvern Cavalier — Dragoncraft follower, 5, 5/5.
// {[fanfare]} Put the top card of your deck into your EX area. It costs 2 less to play.
// (Only when played; minimum 0 — rulings, CR 10.4.4.1, 1.3.2.2.1.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const card of yield* fx.topToEx(1)) yield* fx.changePlayCost(card, -2);
      },
    }),
  ],
});
