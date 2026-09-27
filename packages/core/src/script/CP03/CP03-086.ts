// CP03-086 Blaster Dark — Abysscraft follower, 3, 3/3. ヴァンガード・シャドウパラディン.
// {[evolve]} {[cost01]}: Evolve this follower.
// Single Drive.
// {[fanfare]} Bury the top 2 cards of your deck.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["singleDrive"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
