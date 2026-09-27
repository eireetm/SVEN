// CP02-018 Kyoko Igarashi — Swordcraft follower, 7, 6/7. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} Give your leader {[defense]}+3. Draw 2 cards.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(2);
      },
    }),
  ],
});
