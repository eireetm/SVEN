// BP04-101 Zoe, Princess of Goldenia — Havencraft follower, 4, 3/3. 信仰・プリンセス.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Deal 2 damage to your leader. Put the top 2 cards of your deck into your cemetery. Draw
// a card. (With 1 card left the draw is from an empty deck and you lose — ruling; CR 5.10.1.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
        yield* fx.mill(2);
        yield* fx.draw(1);
      },
    }),
  ],
});
