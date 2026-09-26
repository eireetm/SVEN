// BP18-002 Rolo Roné, Verdant Purifier (Evolved) — 4/4.
// You may play any number of Evolve per turn. (CR 8.3.2.2.)
// On Super-Evolve - Put a Seeds of Salvation token into your EX area.
// Whenever a follower on your field evolves, select an enemy follower on the field and deal it 4 damage. (Super-evolving
// too; during the opponent's turn too — rulings.)
import { defineCard, onSuperEvolve, whenYourFollowerEvolves } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  field: { unlimitedEvolve: true },
  abilities: [
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Seeds of Salvation"]);
      },
    }),
    whenYourFollowerEvolves({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
