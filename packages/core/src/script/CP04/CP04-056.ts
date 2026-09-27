// CP04-056 Sheffy (Evolved) — Dragoncraft, 3/3. プリコネ・美食殿.
// On Evolve - Select up to 2 enemy followers on the field and deal 2 damage divided between them. (At least 1 each.)
// On Super-Evolve - Deal 3 damage to each enemy follower on the field.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0]!, 2);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
