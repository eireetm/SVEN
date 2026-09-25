// BP06-089 Berserker's Pelt — Abysscraft amulet, 2. 獣.
// Once on each of your turns, when your leader loses defense, select a follower on your field and
// give it {[attack]}+1/{[defense]}+1. (CR 10.7.2.2)
// Activate {[engage]}, bury this card: Give your leader {[defense]}+2. Activate only if your
// leader's defense is 10 or less.
import { activated, defineCard, whenYourLeaderLosesDefense } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    whenYourLeaderLosesDefense(
      {
        oncePerTurn: true,
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
      { onlyYourTurn: true },
    ),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.state.players[c].leaderDefense <= 10,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
