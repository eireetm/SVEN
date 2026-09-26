// BP10-042 Checkmate — Runecraft spell, 3. チェス.
// Activate Banish this card from your cemetery: Select a Mystic King on your field and give it Storm.
// (Valid in the cemetery — ruling, CR 10.3.5.)
// ----------
// Deal each enemy follower on the field damage equal to the number of Chess cards in your cemetery.
// (Not counting itself: it is in the resolution zone — ruling.)
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { hasTrait, named, yourFollower } from "../targets";
import { inCemetery } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        targets: [yourFollower({ filter: named("Mystic King") })],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
        },
      },
    ),
    spell({
      *resolve(fx) {
        const x = inCemetery(fx.game, fx.controller, hasTrait("チェス"));
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), x);
      },
    }),
  ],
});
