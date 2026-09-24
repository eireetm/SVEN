// BP02-068 Draconic Armor — Dragoncraft spell, 1.
// Summon a Draconic Weapon token. If Overflow is active for you, summon 2 instead. (CR 13.4)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const n = fx.game.overflow(fx.controller) ? 2 : 1;
        yield* fx.summon(Array<string>(n).fill("Draconic Weapon"));
      },
    }),
  ],
});
