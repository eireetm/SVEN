// BP21-013 Bladebunny — Forestcraft follower, 1, 1/2. 獣.
// {[evolve]} {[cost00]}: Evolve this. Activate only if a card was returned to hand from your field this turn. (Any card of
// yours — ruling.)
// When this is returned to hand from your field, you may summon a Bladebunny from your hand. (Itself too; by the opponent's
// effects too — rulings.)
import { defineCard, evolveAbility, whenReturnedToHand } from "../helpers";
import { named } from "../targets";

const bunny = named("Bladebunny");

export default defineCard({
  abilities: [
    evolveAbility(0, { condition: (g, c) => g.returnedToHandThisTurn(c) >= 1 }),
    whenReturnedToHand({
      *resolve(fx) {
        const bunnies = fx.game.cards(fx.controller, "hand").filter((id) => bunny(fx.game, id));
        const chosen = yield* fx.chooseCards(bunnies, 0, 1);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
      },
    }),
  ],
});
