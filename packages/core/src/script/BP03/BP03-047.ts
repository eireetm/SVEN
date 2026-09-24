// BP03-047 Magical Knight (Evolved) — Runecraft, 4/4.
// On Evolve: Summon a Magical Pawn.
// Whenever another Chess follower is put onto your field, give it +1 attack.
import { defineCard, onEvolve, whenFollowerEntersYourField } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Magical Pawn"]);
      },
    }),
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
