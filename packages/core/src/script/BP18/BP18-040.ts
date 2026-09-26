// BP18-040 Mana, Sterling Luster (Evolved) — 3/3.
// On Evolve - Banish another follower from your field: Select an enemy follower on the field. Destroy it and draw a card.
// (Not with a follower that can't be banished by abilities; without a target nothing happens — rulings; CR 10.4.7.4.)
// On Super-Evolve - Put an Adorn with Jewels token into your EX area.
import type { CustomCost } from "../types";
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

const banishAnotherFollower: CustomCost = {
  canPay: (g, c, self) => g.followers(c).some((id) => id !== self && g.banishableByAbilities(id)),
  *pay(fx) {
    const others = fx.game.followers(fx.controller).filter((id) => id !== fx.self && fx.game.banishableByAbilities(id));
    yield* fx.banish(yield* fx.chooseCards(others, 1, 1));
  },
};

export default defineCard({
  abilities: [
    onEvolve({
      cost: banishAnotherFollower,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Adorn with Jewels"]);
      },
    }),
  ],
});
