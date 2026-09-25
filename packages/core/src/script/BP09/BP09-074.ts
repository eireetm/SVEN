// BP09-074 Darkfeast Bat — Abysscraft follower, 6, 4/4. 吸血鬼・獣.
// {[fanfare]} Select an enemy follower on the field. Deal 4 damage to it and its leader and, if Sanguine
// is active for you, recover 3 play points. (Without a target the Fanfare can't be played, so no play
// points either — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 4);
        if (fx.game.sanguine(fx.controller)) yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
