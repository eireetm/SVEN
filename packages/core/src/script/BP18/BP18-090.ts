// BP18-090 Gnawing Rat — Abysscraft follower, 2, 2/2. 透京・魔界・獣.
// When playing this, discard a 2-cost card: This costs 1 less. (CR 10.4.7.3; another card than this one, 元のコスト.)
// ----------
// {[evolve]} {[cost04]}: Evolve this.
// {[fanfare]} Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costsTwo } from "./shared";

export default defineCard({
  playOptions: [
    {
      id: "discard2",
      label: "Discard a 2-cost card: 1 less",
      costDelta: -1,
      canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self && costsTwo(g, id)),
      *pay(fx) {
        const twos = fx.game.cards(fx.controller, "hand").filter((id) => id !== fx.self && costsTwo(fx.game, id));
        yield* fx.discardCards(yield* fx.chooseCards(twos, 1, 1));
      },
    },
  ],
  abilities: [
    evolveAbility(4),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
