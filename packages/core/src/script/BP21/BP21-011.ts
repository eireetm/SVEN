// BP21-011 Fauna Handler — Forestcraft follower, 1, 1/1. 学院・獣.
// When this leaves the field, select an Academic or Beast follower on your field and give it {[attack]}+1/{[defense]}+1.
import { defineCard, whenThisLeavesField } from "../helpers";
import { yourFollower } from "../targets";
import { academicOrBeastFollower } from "./shared";

export default defineCard({
  abilities: [
    whenThisLeavesField({
      targets: [yourFollower({ filter: academicOrBeastFollower })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
