// BP05-015 Flower Doll (Evolved) — Forestcraft follower, 3/3. 人形・植物族.
// {[lastwords]} Select up to 1 Puppetry follower in your cemetery (including this one) and add it
// to your hand. (The unevolved Flower Doll is in the cemetery by then and can be chosen — ruling.)
import { defineCard, lastWords } from "../helpers";
import { and, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    lastWords({
      targets: [inYourZone("cemetery", { upTo: true, filter: and(isFollower, hasTrait("人形")) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0] ?? []);
      },
    }),
  ],
});
