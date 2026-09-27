// CP04-119 Ayumi — Neutral follower, 1, 2/2. プリコネ・ヴァイスフリューゲル.
// {[ub]} Strike - Select an enemy follower on the field. It doesn't refresh during its controller's next start phase. (The scraped
// official English text belongs to another card.)
import { defineCard, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      strike({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.skipNextRefresh(fx.targets[0]![0]!);
        },
      }),
    ),
  ],
});
