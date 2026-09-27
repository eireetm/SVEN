// CP03-106 CEO Amaterasu — Havencraft follower, 4, 4/4. ヴァンガード・オラクルシンクタンク.
// {[evolve]} {[cost02]}: Evolve this follower.
// Assail. Twin Drive.
// {[fanfare]} Look at the top 2 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on
// the bottom in any order.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { arrangeTop } from "./shared";

export default defineCard({
  keywords: ["assail", "twinDrive"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* arrangeTop(fx, 2);
      },
    }),
  ],
});
