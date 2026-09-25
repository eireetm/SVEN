// BP09-072 Oldblood King — Abysscraft follower, 4, 2/4. 吸血鬼.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon 2 Forest Bat tokens.
// While this card is on your field, each Forest Bat on your field has Rush and Assail. (Losing them
// during an attack doesn't stop it or change its target — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FOREST_BAT, forestBatsRushAssail } from "./shared";

export default defineCard({
  field: { keywordsFor: forestBatsRushAssail },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([FOREST_BAT, FOREST_BAT]);
      },
    }),
  ],
});
