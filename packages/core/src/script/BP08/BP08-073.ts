// BP08-073 Tartarus the Tormentor (Evolved) — Abysscraft follower, 8/8. 魔界.
// On Evolve — Select a Departed follower in your cemetery and put it onto the field (CR 5.5,
// 12.6.1).
import { defineCard, onEvolve } from "../helpers";
import { and, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("死者")) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
