// BP06-039 Curse Crafter — Runecraft follower, 4, 2/2. 陰陽師.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Paper Shikigami token.
// Activate Bury a Shikigami follower: Select an enemy follower on the field and deal it 4 damage.
// For the rest of this turn, this card's Activate abilities except Evolve can't be activated.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { curseCrafterAbility } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Paper Shikigami"]);
      },
    }),
    curseCrafterAbility(true),
  ],
});
