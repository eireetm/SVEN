// BP14-099 Twinblade Featherfolk — Havencraft follower, 4, 3/3. 鳥族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and bury the top card of your deck. If you buried a
// non-{[havencraft]} card, deal 4 damage to the selected follower. (Not played without a target — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, isClass } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const [buried] = yield* fx.mill(1);
        if (buried !== undefined && !isClass("Havencraft")(fx.game, buried)) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
