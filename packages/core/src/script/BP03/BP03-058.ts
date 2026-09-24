// BP03-058 Lævateinn Dragon, Attack Form — Dragoncraft evolved follower, 7/5. 竜族・武装.
// Strike: Select an enemy follower. Deal 4 to it and 3 to its leader.
// This follower's name is also Lævateinn Dragon — while on the field only (ruling). The other
// card's abilities are not gained. It is a different card name for the evolve-deck copy limit.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  alsoNames: ["Lævateinn Dragon"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        const id = fx.targets[0]![0]!;
        yield* fx.dealDamage(id, 4);
        yield* fx.dealDamage(fx.game.leader(fx.game.controller(id)), 3);
      },
    }),
  ],
});
