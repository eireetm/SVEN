// BP03-074 Masquerade Ghost — Abysscraft follower, 4, 4/4. 死者.
// {[evolve]} {[cost01]}: Evolve.
// Whenever a Ghost is put onto your field, give it +1 attack. The bonus remains after this
// card leaves (ruling). "Ghost" is the exact name, including cards whose name is also Ghost.
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const id = fx.data?.card;
          if (id) yield* fx.giveStats(id, 1, 0);
        },
      },
      { filter: named("Ghost") },
    ),
  ],
});
