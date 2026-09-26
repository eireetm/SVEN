// BP21-043 Mysterian Exchange Party — Runecraft spell, 7. 魔法使い・学院・プリンセス.
// When this is discarded by the ability of an Academic card you control, draw a card. (Its effect or its cost.)
// ----------
// Look at the top 5 cards of your deck. You may summon up to 3 Academic followers that cost a total of 6 or less from among
// them. Put the rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, selectWithinTotalCost, spell, whenDiscardedByYourCard } from "../helpers";
import { academicFollower } from "./shared";

export default defineCard({
  abilities: [
    whenDiscardedByYourCard(
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
      (cause) => cause.traits.includes("学院"),
    ),
    spell({
      *resolve(fx) {
        const top = fx.topCards(5);
        const chosen = yield* selectWithinTotalCost(fx, top.filter((id) => academicFollower(fx.game, id)), 6, 3, top);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
