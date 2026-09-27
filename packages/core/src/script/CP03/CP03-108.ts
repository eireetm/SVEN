// CP03-108 Silent Tom — Havencraft follower, 3, 3/3. ヴァンガード・オラクルシンクタンク.
// {[evolve]} {[cost01]}: Evolve this card.
// Single Drive.
// {[fanfare]} Select up to 1 card in your cemetery and put it into your deck 3rd from the top. (Selecting none is allowed —
// ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { inYourZone } from "../targets";

export default defineCard({
  keywords: ["singleDrive"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { upTo: true })],
      *resolve(fx) {
        const [card] = fx.targets[0] ?? [];
        if (card !== undefined) yield* fx.putIntoDeckAt(card, 3);
      },
    }),
  ],
});
