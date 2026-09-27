// ECP01-028 Neo Universe — Dragoncraft follower, 3, 3/3. ウマ娘.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select an enemy follower on the field. If Overflow is active for you, deal it 4 damage and draw a card. (Not
// playable without an enemy follower to select, so no draw then — ruling.)
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.draw(1);
      },
    }),
  ],
});
