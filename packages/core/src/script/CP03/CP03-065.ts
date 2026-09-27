// CP03-065 Burning Horn Dragon — Dragoncraft follower, 2, 3/2. ヴァンガード・かげろう.
// Rush.
// {[fanfare]} If there's a follower with "Overlord" in its name on your field, give this follower {[attack]}+2/{[defense]}+2.
// Whenever a follower on your field performs a drive check, select an enemy leader or enemy follower on the field and deal it 1
// damage. (After the drive check; twice for Twin Drive — rulings.)
import { defineCard, fanfare, whenYourFollowerDriveChecks } from "../helpers";
import { enemyLeaderOrFollower, nameIncludes } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      condition: (g, c) => g.followers(c).some((id) => nameIncludes("Overlord")(g, id)),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
    whenYourFollowerDriveChecks({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
