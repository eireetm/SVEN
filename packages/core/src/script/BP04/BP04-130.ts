// BP04-130 Night's Way — Neutral amulet, 3. 光輝・星神.
// Activate {[engage]}: If there are no cards in your EX area, put the top card of your deck into your
// EX area. (A token there counts as a card — ruling.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          if (fx.game.cards(fx.controller, "ex").length === 0) yield* fx.topToEx(1);
        },
      },
    ),
  ],
});
