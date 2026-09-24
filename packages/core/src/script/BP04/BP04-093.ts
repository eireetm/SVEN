// BP04-093 Castor — Abysscraft follower, 3, 3/4. 死者・星神.
// {[lastwords]} {[cost02]} Put this follower onto its owner's field.
import { defineCard, lastWords } from "../helpers";
import { playPointsCost } from "../costs";

export default defineCard({
  abilities: [
    lastWords({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.putOntoField([fx.self], fx.game.card(fx.self)?.owner ?? fx.controller);
      },
    }),
  ],
});
