// BP02-093 Kaguya (Evolved) — 5/5.
// On Evolve: Summon an Ephemeral Moon token. Give your leader {[defense]}+3.
// Whenever an amulet is put onto your field, select an enemy follower on the field and deal it X
// damage. X equals the amulet's cost.
import { defineCard, onEvolve } from "../helpers";
import { amuletEntersDamage } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Ephemeral Moon"]);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
    amuletEntersDamage,
  ],
});
