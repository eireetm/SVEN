// CSD02b-001 Rin Shibuya [Triad Primus] — Swordcraft follower, 3, 3/3. デレマス・クール.
// Storm.
// {[fanfare]} If there are at least 3 Cool followers on your field, select another follower with 3 attack or less on your field and
// give it Storm. (This one counts.)
// {[act]} {[cost01]}, Lesson (1): Give this follower {[attack]}+1. Activate only once per turn.
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { cool, followersOnYourField } from "../CP02/shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [
        anotherYourFollower({
          when: (g, c) => followersOnYourField(g, c, cool) >= 3,
          filter: (g, id) => (g.info(id).attack ?? 0) <= 3,
        }),
      ],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.giveKeyword(target, "storm");
      },
    }),
    activated(
      { playPoints: 1, custom: lesson(1) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 1, 0);
        },
      },
    ),
  ],
});
