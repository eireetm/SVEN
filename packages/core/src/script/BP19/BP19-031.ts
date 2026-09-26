// BP19-031 Return from the Brink — Swordcraft spell, 1. 兵士.
// Select an Officer follower in your cemetery. Put it into your EX area and give it {[attack]}+1/{[defense]}+1. (It keeps them
// when played from there — CR 10.6.2.1.3, 4.8.3.3.)
import { defineCard, spell } from "../helpers";
import { and, inYourZone, isFollower } from "../targets";
import { officer } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, officer) })],
      *resolve(fx) {
        for (const id of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
