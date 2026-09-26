// BP16-033 Luminous Lancetrooper — Swordcraft follower, 2, 1/1. 指揮官・ルミナス.
// {[fanfare]} Summon a Steelclad Knight token.
// {[act]} {[cost00]}: Select an Officer token follower on your field and give it {[attack]}+2 and Storm. Activate
// only if there are at least 3 Officer token followers on your field with different names, and only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { STEELCLAD } from "./shared";
import { officerTokenFollower, threeOfficerNames } from "./shared-sword";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([STEELCLAD]);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: threeOfficerNames,
        targets: [yourFollower({ filter: officerTokenFollower })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveStats(target, 2, 0);
          yield* fx.giveKeyword(target, "storm");
        },
      },
    ),
  ],
});
