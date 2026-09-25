// BP07-061 Hoarfrost Triceratops (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
// {[lastwords]} Summon a Naterran Great Tree token.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { summonTreeLastWords } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    summonTreeLastWords,
  ],
});
