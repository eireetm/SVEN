// BP13-058 Godfire Phoenix (Evolved) — Dragoncraft follower, 6/6. 不死鳥.
// At the start of your end phase, select an enemy follower on the field. If you have 10 max play points,
// banish it and give your leader {[defense]}+3. (Not played without a target — ruling.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.state.players[fx.controller].maxPlayPoints < 10) return;
        yield* fx.banish(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
