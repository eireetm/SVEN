// CP01-028 Agnes Tachyon (Evolved) — 3/3.
// On Evolve: Select a spell in your cemetery and add it to your hand.
// Whenever you play a spell, select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1.
import { defineCard, onEvolve } from "../helpers";
import { inYourZone, isSpell } from "../targets";
import { tachyonSpellPlayed } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: isSpell })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
    tachyonSpellPlayed(),
  ],
});
