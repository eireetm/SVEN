// BP03-046 Magical Knight — Runecraft follower, 3, 3/3. チェス.
// {[evolve]} {[cost01]}: Evolve.
// Whenever another Chess follower is put onto your field, give it +1 attack.
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const id = fx.data?.card;
          if (id && fx.game.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 0);
        },
      },
      { another: true, filter: hasTrait("チェス") },
    ),
  ],
});
