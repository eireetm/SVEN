// BP14-072 Paracelise, Demon of Greed — Abysscraft follower, 3, 3/3. 宴楽・魔界.
// {[evolve]} {[cost01]}: Evolve this. Activate only if there are 0 cards in your hand.
// {[fanfare]} Put the top card of your deck into your EX area. Discard a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1, { condition: (g, p) => g.cards(p, "hand").length === 0 }),
    fanfare({
      *resolve(fx) {
        yield* fx.topToEx(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
