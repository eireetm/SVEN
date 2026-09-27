// ECP01-040 Duramente — Abysscraft follower, 5, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. If there are at least 10 Umamusume cards in your cemetery, recover 3
// play points.
// {[fanfare]} Select an enemy follower on the field. Destroy it, deal 2 damage to its leader, give your leader {[defense]}+2, and
// bury the top 2 cards of your deck. (Not playable without an enemy follower to select — ruling.)
import { defineCard, fanfare, onRace, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { plusOneThis, umamusumeInCemetery } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
        if (umamusumeInCemetery(fx.game, fx.controller) >= 10) yield* fx.recoverPlayPoints(3);
      },
    }),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        const target = fx.targets[0]![0]!;
        const leader = g.leader(g.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.mill(2);
      },
    }),
  ],
});
