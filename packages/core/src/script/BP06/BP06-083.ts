// BP06-083 Unleash the Nightmare — Abysscraft spell, 4. 吸血鬼.
// This card costs 1 less to play if there's a Vampire card on your field.
// Summon 3 Forest Bat tokens. Draw 2 cards. (Playable with a full field: no bats — ruling.)
import { defineCard, spell } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  playCost: (g, _self, controller) => (g.cards(controller, "field").some((id) => hasTrait("吸血鬼")(g, id)) ? -1 : 0),
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Forest Bat", "Forest Bat", "Forest Bat"]);
        yield* fx.draw(2);
      },
    }),
  ],
});
