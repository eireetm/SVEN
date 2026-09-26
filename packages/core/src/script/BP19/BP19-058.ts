// BP19-058 Drazael, Ravening Enforcer (Evolved) — 5/6.
// Ward.
// This can't be destroyed by abilities.
// On Evolve - Bury 2 Condemned cards in your EX area: Give each enemy follower on the field {[attack]}-5/{[defense]}-5. Give
// your leader {[defense]}+5. (CR 10.4.7.4.)
// {[lastwords]} Put this into its owner's EX area.
import { defineCard, onEvolve } from "../helpers";
import { backToEx, buryCondemnedFromEx } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  cannotBeDestroyedByAbilities: true,
  abilities: [
    onEvolve({
      cost: buryCondemnedFromEx(2),
      *resolve(fx) {
        for (const id of fx.game.followers(fx.game.opponent(fx.controller))) yield* fx.giveStats(id, -5, -5);
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
    backToEx,
  ],
});
