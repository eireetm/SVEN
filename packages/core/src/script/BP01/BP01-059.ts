// BP01-059 Spectral Wizard — Runecraft follower, 2, 2/2.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[fanfare]} Look at the top card of your deck. If it's a spell, you may reveal it and add it
// to your hand. ("may" — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        const spells = top.filter((id) => isSpell(fx.game, id));
        const chosen = yield* fx.selectCards(spells, 0, 1, fx.controller, top);
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
      },
    }),
  ],
});
