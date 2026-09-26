// BP18-T02 All-Access Search — Swordcraft spell token, 1. 透京・探偵.
// Place 3 gigabyte counters on each Gigabyte Blade on your field. Draw 2 cards.
import { defineCard, spell } from "../helpers";
import { chargeBlades } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* chargeBlades(fx, 3);
        yield* fx.draw(2);
      },
    }),
  ],
});
