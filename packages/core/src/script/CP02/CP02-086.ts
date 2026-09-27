// CP02-086 Kaede Takagaki — Havencraft follower, 5, 3/5. デレマス・クール.
// Ward.
// {[fanfare]} Select an enemy follower on the field and banish it.
// At the start of your end phase, if your leader's defense is 5 or less, give it {[defense]}+5 and draw a card. (Checked when it
// resolves: with two Kaedes the second does nothing after the first healed — rulings; no draw either.)
// {[act]} {[cost01]}, Lesson (1): Give this follower Aura.
import { lesson } from "../costs";
import { activated, atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, c) => g.state.players[c].leaderDefense <= 5,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
        yield* fx.draw(1);
      },
    }),
    activated(
      { playPoints: 1, custom: lesson(1) },
      {
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "aura");
        },
      },
    ),
  ],
});
