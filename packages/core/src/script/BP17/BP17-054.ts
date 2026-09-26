// BP17-054 Mysterian Wisdom — Runecraft spell, 1. 魔法使い・学院.
// As an additional cost to play this, reveal an Academic card from your hand and put it on the bottom of your deck.
// ----------
// Draw 2 cards.
import type { PlayOption } from "../types";
import { defineCard, spell } from "../helpers";
import { academic } from "./shared";

const revealAcademicToBottom: PlayOption = {
  id: "academic",
  label: "Reveal an Academic card from your hand and put it on the bottom of your deck",
  canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self && academic(g, id)),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "hand").filter((id) => id !== fx.self && academic(fx.game, id));
    const chosen = yield* fx.chooseCards(cards, 1, 1);
    yield* fx.reveal(chosen);
    yield* fx.putOnDeck(chosen, "bottom");
  },
};

export default defineCard({
  playOptionsRequired: true,
  playOptions: [revealAcademicToBottom],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
