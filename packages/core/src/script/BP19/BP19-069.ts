// BP19-069 Dancing Crab (Evolved) — 4/4.
// Intimidate.
// Strike - Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1.
// On Evolve - Select an enemy follower on the field and engage it.
import { defineCard, onEvolve, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { crabPinch } from "./shared-dragon";

export default defineCard({
  keywords: ["intimidate"],
  abilities: [
    strike(crabPinch),
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
  ],
});
