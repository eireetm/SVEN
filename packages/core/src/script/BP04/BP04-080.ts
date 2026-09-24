// BP04-080 Howling Demon — Abysscraft follower, 5, 5/4. 魔界・シンガー.
// {[evolve]} {[cost03]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage. If Sanguine is active for
// you, deal 8 damage instead.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(3),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.sanguine(fx.controller) ? 8 : 4);
      },
    }),
  ],
});
