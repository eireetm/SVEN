// BP11-017 Scavenge — Forestcraft spell, 2. 人形.
// Select a Puppetry card in your cemetery. Add it to your hand and put a Puppet token into your EX area.
// (Without a Puppetry card there it can't be played — ruling.)
import { defineCard, spell } from "../helpers";
import { hasTrait, inYourZone } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: hasTrait("人形") })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        yield* fx.tokensToEx(["Puppet"]);
      },
    }),
  ],
});
