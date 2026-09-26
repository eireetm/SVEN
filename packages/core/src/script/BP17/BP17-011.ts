// BP17-011 Heroic Resolve — Forestcraft spell, 2. 獣.
// This costs 1 less to play from the EX area.
// This costs 1 less to play if there's a follower on your field with "Setus" in its name. (Both: 2 less — ruling.)
// ----------
// Select an enemy follower on the field and a Beast follower on your field. Deal 4 damage to the first follower and give
// {[attack]}+1/{[defense]}+1 to the second. (Not playable without both — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { beast, followerNamedOnField } from "./shared";

export default defineCard({
  playCost: (g, self, p) => (g.playZone(self) === "ex" ? -1 : 0) + (followerNamedOnField(g, p, "Setus") ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower(), yourFollower({ filter: beast })],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveStats(fx.targets[1]![0]!, 1, 1);
      },
    }),
  ],
});
