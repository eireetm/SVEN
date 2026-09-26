// BP11-055 Georgius — Dragoncraft follower, 4, 4/4. 竜族・武闘竜人・キラー.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and, if Overflow is active for you, deal 2 damage
// to it and its leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 2);
      },
    }),
  ],
});
