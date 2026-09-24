// BP03-078 Baccherus, Peppy Ghostie — Abysscraft follower, 1, 1/1. 死者.
// This follower's name is also Ghost while it is on the field (ruling: the name only).
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} If a Gargantuan Ghost is on your field, draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  alsoNames: ["Ghost"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const ghost = fx.game.followers(fx.controller).some((id) => named("Gargantuan Ghost")(fx.game, id));
        if (ghost) yield* fx.draw(1);
      },
    }),
  ],
});
