// BP01-002 Ancient Elf — Forestcraft follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower. // Ward.
// {[fanfare]} Return another card on your field to its owner's hand: Give this follower +1/+1.
// The return is an optional cost (CR 10.4.7.4); only cards on your own field (rulings).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { returnAnotherCardOnYourField } from "../costs";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: returnAnotherCardOnYourField,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
