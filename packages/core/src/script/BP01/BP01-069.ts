// BP01-069 Crafty Warlock (Evolved) — 3/3.
// {[lastwords]} Summon a Magic Sediment token. Add 1 to a Stack on your field.
// ("Add 1 to a Stack": one Stack card of your choice gets a Stack counter; with none, a Magic
// Sediment with 1 counter is put onto the field — ruling (rule change of 2026-07-31), CR 13.3.2.4.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
        yield* fx.addToStack(1);
      },
    }),
  ],
});
