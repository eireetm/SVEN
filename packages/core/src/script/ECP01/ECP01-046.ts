// ECP01-046 Satono Crown — Havencraft follower, 3, 3/3. ウマ娘.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select an enemy leader. If your leader has less defense than it, give your leader {[defense]}+2.
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";
import { enemyLeader } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    serveAbility(1, 1),
    fanfare({
      targets: [enemyLeader()],
      *resolve(fx) {
        const g = fx.game;
        const theirs = g.state.players[g.controller(fx.targets[0]![0]!)].leaderDefense;
        if (g.state.players[fx.controller].leaderDefense < theirs) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
