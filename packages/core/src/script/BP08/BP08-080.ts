// BP08-080 Arion — Abysscraft follower, 6, 3/3. 魔界.
// Rush.
// {[lastwords]} Select an Abysscraft follower with original cost 5 or less in your cemetery and put
// it onto the field. A follower moved there simultaneously is a legal target (ruling,
// CR 10.7.4.2, 12.5.3).
import { defineCard, lastWords } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Abysscraft"), costAtMost(5)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
