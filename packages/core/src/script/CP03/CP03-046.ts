// CP03-046 Crimson Beast Tamer — Runecraft follower, 4, 3/3. ヴァンガード・ペイルムーン.
// {[evolve]} {[cost01]}: Evolve this follower into a Barking Manticore.
// Ward.
// {[fanfare]} Banish a Pale Moon card from your hand: Draw 2 cards.
import { banishFromYour } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { paleMoon } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1, { into: ["Barking Manticore"] }),
    fanfare({
      cost: banishFromYour(["hand"], paleMoon, 1),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
