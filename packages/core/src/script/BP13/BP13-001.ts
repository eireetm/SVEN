// BP13-001 Sekka, Fatebound Fox — Forestcraft follower, 1, 1/1. 荒野・狩人・獣.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a {[forestcraft]} card that costs 2 or
// less from among them and add it to your hand. Put the rest on the bottom of your deck in any order. If
// you revealed a card, discard a card. (元のコスト.)
// {[act]} {[cost03]}, banish this card and 2 other cards from your cemetery: You may summon a Sekka,
// Ninefold Blaze from your evolve deck. (Valid in the cemetery — ruling, CR 10.3.5; an advanced card, CR
// 9.2.)
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, isClass, named } from "../targets";

/** "Banish this card and 2 other cards from your cemetery" (together). */
const banishThisAndTwo: CustomCost = {
  canPay: (g, c, self) => g.card(self)?.zone === "cemetery" && g.cards(c, "cemetery").filter((id) => id !== self).length >= 2,
  *pay(fx) {
    const others = yield* fx.chooseCards(fx.game.cards(fx.controller, "cemetery").filter((id) => id !== fx.self), 2, 2);
    yield* fx.banish([fx.self, ...others]);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const revealed = yield* lookAtTopCards(fx, 3, { filter: and(isClass("Forestcraft"), costAtMost(2)), to: "hand" });
        if (revealed.length > 0) yield* fx.discard(fx.controller, 1, 1);
      },
    }),
    activated(
      { playPoints: 3, custom: banishThisAndTwo },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          yield* fx.fromEvolveDeck((id) => named("Sekka, Ninefold Blaze")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
