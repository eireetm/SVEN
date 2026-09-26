// BP20-004 Plumeria, Serene Goddess — Forestcraft follower, 1, 1/1. 植物族.
// Once per turn, when a 5-cost or less Verdant follower on your field evolves, give it Storm. (Super-evolving too; on the
// opponent's turn too — rulings. 元のコスト.)
// {[fanfare]} If there are at least 3 Verdant cards in your cemetery, draw a card.
import { defineCard, fanfare, whenYourFollowerEvolves } from "../helpers";
import { costAtMost } from "../targets";
import { verdant } from "./shared";

export default defineCard({
  abilities: [
    {
      ...whenYourFollowerEvolves(
        {
          *resolve(fx) {
            const card = fx.data?.card;
            if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveKeyword(card, "storm");
          },
        },
        (g, id) => verdant(g, id) && costAtMost(5)(g, id),
      ),
      oncePerTurn: true,
    },
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "cemetery").filter((id) => verdant(fx.game, id)).length >= 3) yield* fx.draw(1);
      },
    }),
  ],
});
