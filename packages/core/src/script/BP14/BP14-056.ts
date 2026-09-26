// BP14-056 Frostbite Dragon — Dragoncraft follower, 7, 5/5. 竜族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select up to 2 enemy followers on the field and engage them.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0] ?? []);
      },
    }),
  ],
});
