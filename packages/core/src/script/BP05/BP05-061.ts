// BP05-061 Cursed Stone (Evolved) — Dragoncraft follower, 3/3. 巨人・超克.
// Ward.
// On Evolve: Select an enemy follower on the field. For the rest of this turn and during each
// opponent's next turn, it loses all abilities and can't attack enemies.
// Rulings: its "when returned to hand" and Last Words don't trigger; abilities given afterwards
// (e.g. Ward) work; both parts last this turn and the opponent's next turn.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.loseAbilities(target, "endOfOpponentsNextTurn");
        yield* fx.cannotAttack(target, "endOfOpponentsNextTurn");
      },
    }),
  ],
});
