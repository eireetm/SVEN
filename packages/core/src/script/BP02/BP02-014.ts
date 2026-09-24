// BP02-014 Forest Gigas — Forestcraft follower, 6, 1/7.
// {[evolve]}{[cost01]}: Evolve this follower. // Ward.
// {[fanfare]} Give this follower {[attack]}+X. X equals the number of cards in your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, fx.game.cards(fx.controller, "ex").length, 0);
      },
    }),
  ],
});
