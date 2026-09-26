// BP08-075 Sonata of Silence — Abysscraft spell, 2. 絶傑・死霊術師.
// Select Rulenye, Omen of Silence in your cemetery and put it onto the field. Necrocharge (10):
// each opponent discards a random card. The Necrocharge count is fixed when resolution begins, so
// exactly 10 still applies after Rulenye leaves the cemetery (rulings, CR 5.19, 13.5.1.3.2).
import { defineCard, spell } from "../helpers";
import { inYourZone, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: named("Rulenye, Omen of Silence") })],
      *resolve(fx) {
        const necrocharge = fx.game.necrocharge(fx.controller, 10);
        yield* fx.putOntoField(fx.targets[0]!);
        if (necrocharge) yield* fx.discardRandom(1, fx.game.opponent(fx.controller));
      },
    }),
  ],
});
