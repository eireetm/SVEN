// CP03-030 Barcgal — Swordcraft follower, 1, 0/1. ヴァンガード・ロイヤルパラディン.
// When this card is discarded by the ability of a Royal Paladin card you control, you may put this card into your EX area.
// (Valid in the hand; a cost's discard counts too, as for BP21-043.)
// ----------
// Ward.
// {[lastwords]} Draw a card.
import { defineCard, lastWords, whenDiscardedByYourCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    whenDiscardedByYourCard(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "cemetery" && (yield* fx.confirm())) yield* fx.putIntoEx([fx.self]);
        },
      },
      (cause) => cause.traits.includes("ロイヤルパラディン"),
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
