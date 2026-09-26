// BP18-015 Verdant Law Supplicant (Evolved) — 2/2.
// On Evolve - Select a Togh Keyoh follower in your cemetery not named Verdant Law Supplicant and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { and, inYourZone, isFollower, named } from "../targets";
import { toghKeyoh } from "./shared";

const supplicant = named("Verdant Law Supplicant");

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, toghKeyoh, (g, id) => !supplicant(g, id)) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
