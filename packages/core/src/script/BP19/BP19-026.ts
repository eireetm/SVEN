// BP19-026 Tidal Gunner — Swordcraft follower, 2, 2/3. 八獄・盗賊.
// Whenever you play a Dread Pirate's Flag, select an enemy leader or enemy follower on the field and deal it 1 damage.
// {[fanfare]} Put a Dread Pirate's Flag token into your EX area.
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { enemyLeaderOrFollower, named } from "../targets";
import { PIRATE_FLAG } from "./shared";

export default defineCard({
  abilities: [
    whenYouPlay(
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      named(PIRATE_FLAG),
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([PIRATE_FLAG]);
      },
    }),
  ],
});
