// BP16-076 Aragavy, Eternal Hunter — Abysscraft follower, 5, 4/4. 挑戦者・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Give your leader {[defense]}-2: Draw a card. (CR 10.4.7.4, 10.4.5.)
import { leaderDefenseCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: leaderDefenseCost(2),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
