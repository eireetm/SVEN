// BP11-038 Magical Gunslinger — Runecraft follower, 4, 3/3. 荒野・魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Bullet Bike token.
// During your turn, whenever a Mount card is put onto your field, select an enemy follower on the field.
// Deal it 2 damage, draw a card, then discard a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { BIKE } from "./shared";
import { gunslingerShot } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([BIKE]);
      },
    }),
    gunslingerShot(),
  ],
});
