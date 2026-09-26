// BP10-021 Alyaska, War Hawker — Swordcraft follower, 5, 4/4. 指揮官・商人.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Search your deck for an Ilmisuna, Discord Hawker, summon it, then shuffle.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named("Ilmisuna, Discord Hawker")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
