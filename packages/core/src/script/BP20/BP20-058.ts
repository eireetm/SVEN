// BP20-058 Azurifrit, Heir to Disdain (Evolved) — 4/6.
// Ward.
// During your turn, whenever this takes ability damage, deal 1 damage to each enemy follower on the field.
// On Evolve - Deal 1 damage to each follower on the field.
// On Super Evolve - Deal 1 damage to each follower on the field and 4 damage to each enemy leader. Change this follower's
// defense to 7. (It survives when the 1 damage takes it to 0; not once destroyed by the other ability first — rulings.)
import { changeStatsTo, defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { azurifritPing } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    azurifritPing,
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamageEach([...fx.game.followers(0), ...fx.game.followers(1)], 1);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        const g = fx.game;
        const opponent = g.opponent(fx.controller);
        yield* fx.dealDamages([
          ...[...g.followers(0), ...g.followers(1)].map((target) => ({ target, amount: 1 })),
          { target: g.leader(opponent), amount: 4 },
        ]);
        if (g.card(fx.self)?.zone === "field") yield* changeStatsTo(fx, fx.self, { defense: 7 });
      },
    }),
  ],
});
