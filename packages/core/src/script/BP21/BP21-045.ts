// BP21-045 Gruinne, Leonardian Provost — Runecraft follower, 1, 1/1. 魔法使い・学院.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Add 1 to a Stack on your field. (If there are no cards on your field with Stack, summon a Magic Sediment token
// with 1 Stack counter — CR 13.3.2.4, ruling.)
// Activate {[engage]} this, Earth Rite (2): Deal 1 damage to each enemy follower on the field.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { gruinneRite } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.addToStack(1);
      },
    }),
    gruinneRite,
  ],
});
