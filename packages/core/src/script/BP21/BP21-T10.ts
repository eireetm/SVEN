// BP21-T10 Crest: Wilbert, Desolate Paladin — Havencraft crest token. 挑戦者・先導.
// {[act]} {[cost00]}: Select a follower with Ward on your field and, if there are at least 3 followers with Ward on your
// field, give it {[attack]}+1/{[defense]}+1. If there are at least 5, give {[attack]}+2/{[defense]}+2 instead. Activate only
// once per turn. (In the EX area, CR 10.3.6. 「5体なら」: a field holds at most 5 followers, so exactly 5 is at least 5.)
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      {},
      {
        timesPerTurn: 1,
        targets: [yourFollower({ filter: (g, id) => g.hasKeyword(id, "ward") })],
        *resolve(fx) {
          const g = fx.game;
          const wards = g.followers(fx.controller).filter((id) => g.hasKeyword(id, "ward")).length;
          const target = fx.targets[0]![0]!;
          if (wards >= 5) yield* fx.giveStats(target, 2, 2);
          else if (wards >= 3) yield* fx.giveStats(target, 1, 1);
        },
      },
    ),
  ],
});
