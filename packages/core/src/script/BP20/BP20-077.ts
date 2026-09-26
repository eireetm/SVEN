// BP20-077 Sham-Nacha, Heir to Entwining (Evolved) — 4/4.
// On Evolve - Put a Crest: Sham-Nacha, Heir to Entwining token into your EX area. (Resolved first, it applies to another
// ability's options — ruling.)
// On Super Evolve - Select an {[abysscraft]} Omen follower from your cemetery, summon it and evolve it. (The English text's
// "with {[evolve]}" is not in the Japanese, Chinese and official English texts; the evolution is by this effect: no cost,
// and it may be declined — rulings.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { and, inYourZone, isFollower } from "../targets";
import { abyssOmen } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Crest: Sham-Nacha, Heir to Entwining"]);
      },
    }),
    onSuperEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, abyssOmen) })],
      *resolve(fx) {
        for (const id of yield* fx.putOntoField(fx.targets[0]!)) yield* fx.evolve(id);
      },
    }),
  ],
});
