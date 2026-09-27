// CSD02c-006 Suzuho Ueda (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field. Reveal the top card of your deck and deal damage equal to its cost to the
// selected follower. (元のコスト. The follower is selected first, when it is played — ruling, CR 10.6.2.3.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.reveal([top]);
        const cost = fx.game.db.get(fx.game.card(top)!.def).cost ?? 0;
        yield* fx.dealDamage(fx.targets[0]![0]!, cost);
      },
    }),
  ],
});
