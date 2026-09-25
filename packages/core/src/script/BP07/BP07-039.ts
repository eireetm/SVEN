// BP07-039 Eleanor, Cosmic Flower — Runecraft follower, 2, 2/2. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Discard a spell: Draw a card. (CR 10.4.7.4)
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardA(isSpell),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
