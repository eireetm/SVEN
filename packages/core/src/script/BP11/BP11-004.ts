// BP11-004 Terrorformer — Forestcraft follower, 6, 0/4. 精霊.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[act]} {[cost02]}, put this card from your hand into your EX area: Put the top card of your deck
// into your EX area. (Valid in the hand; the cost goes first, so with 4 cards in the EX area the top
// card stays — rulings, CR 10.3.5.)
// Activate Banish 2 other cards from your EX area: Give this card in your EX area {[attack]}+2. Draw a
// card. Activate only once per turn. (Valid in the EX area; the +2 stays when it is played or put onto
// the field from there — rulings, CR 4.8.3.3.)
import type { CustomCost } from "../types";
import { putThisFromHandIntoEx } from "../costs";
import { activated, defineCard, evolveAbility } from "../helpers";

/** "Banish 2 other cards from your EX area". */
const banishTwoOthers: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "ex").filter((id) => id !== self).length >= 2,
  *pay(fx) {
    const others = fx.game.cards(fx.controller, "ex").filter((id) => id !== fx.self);
    yield* fx.banish(yield* fx.chooseCards(others, 2, 2));
  },
};

export default defineCard({
  abilities: [
    evolveAbility(1),
    activated(
      { playPoints: 2, custom: putThisFromHandIntoEx },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.topToEx(1);
        },
      },
    ),
    activated(
      { custom: banishTwoOthers },
      {
        validIn: ["ex"],
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "ex") yield* fx.giveStats(fx.self, 2, 0);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
