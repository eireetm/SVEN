// CP03-043 Nightmare Doll, Alice — Runecraft follower, 3, 3/3. ヴァンガード・ペイルムーン.
// {[evolve]} {[cost01]}: Evolve this follower.
// Twin Drive.
// {[fanfare]} Banish the top card of your deck. If there are at least 5 cards in your banished zone, draw a card. (The card just
// banished counts — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["twinDrive"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.banish(fx.topCards(1));
        if (countIn(fx.game, fx.controller, "banished") >= 5) yield* fx.draw(1);
      },
    }),
  ],
});
