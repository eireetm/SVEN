// BP04-020 Mars, Silent Flame General — Swordcraft follower, 3, 3/2. 指揮官・星神.
// {[evolve]} {[cost00]}: Evolve this follower.
// Whenever an Officer follower is put onto your field, give it +1 attack. (Two copies both
// trigger — ruling.)
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(0),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const id = fx.data?.card;
          if (id && fx.game.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 0);
        },
      },
      { filter: hasTrait("兵士") },
    ),
  ],
});
