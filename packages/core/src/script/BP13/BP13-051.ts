// BP13-051 Cat Summoner — Runecraft follower, 3, 2/2. 魔法使い・獣.
// {[fanfare]} Select a Beast or Arcanaform follower that costs 2 or less in your cemetery and summon it.
// (Arcanaform: 魔法生物; 元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, hasTrait, inYourZone, isFollower } from "../targets";
import { beast } from "./shared";

const arcanaform = hasTrait("魔法生物");

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(2), (g, id) => beast(g, id) || arcanaform(g, id)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
