// BP18-085 Crescent Moon of Centennial Death — Abysscraft spell, 2. 透京・魔界.
// Select a 2-cost Togh Keyoh follower in your cemetery and summon it. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { and, inYourZone, isFollower } from "../targets";
import { costsTwo, toghKeyoh } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, toghKeyoh, costsTwo) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
