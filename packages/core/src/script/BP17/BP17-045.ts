// BP17-045 Marie, Flowery Magician — Runecraft follower, 4, 2/2. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Bury the top 2 cards of your deck. If you buried a non-{[runecraft]} card, draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const buried = yield* fx.mill(2);
        if (buried.some((id) => !isClass("Runecraft")(fx.game, id))) yield* fx.draw(1);
      },
    }),
  ],
});
