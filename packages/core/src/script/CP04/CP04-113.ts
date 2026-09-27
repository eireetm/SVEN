// CP04-113 Ameth — Neutral follower, 2, 2/2. プリコネ.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Look at the top card of your deck. If it's a PriConne card, you may reveal it and add it to your hand. (Not taken, it
// stays on top, unrevealed — ruling. The scraped official English text belongs to another card.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { mayTakeTopCard, priconne } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, priconne);
      },
    }),
  ],
});
